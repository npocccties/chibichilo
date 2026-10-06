import { useCallback, useEffect, useState } from "react";
import type { VideoMedia } from "$utils/video/media";

type Playable = VideoMedia | HTMLVideoElement;

/** media がマウント後に遅延で付くことがあるため、取得できるまで再試行する間隔 */
const ATTACH_POLL_MS = 200;

/** メディア要素を一時停止しているかどうか */
function usePaused(
  getPlayer: () => Playable | null | undefined
): [boolean, () => void] {
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let attached: Playable | null = null;
    let pollId: ReturnType<typeof setInterval> | undefined;

    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);

    const detach = () => {
      if (!attached) return;
      attached.removeEventListener("play", onPlay);
      attached.removeEventListener("pause", onPause);
      attached.removeEventListener("ended", onPause);
      attached = null;
    };

    const attach = (player: Playable) => {
      if (attached === player) return;
      detach();
      attached = player;
      setPaused(player.paused);
      player.addEventListener("play", onPlay);
      player.addEventListener("pause", onPause);
      player.addEventListener("ended", onPause);
    };

    const tryAttach = () => {
      if (cancelled) return;
      const player = getPlayer();
      if (!player) return false;
      attach(player);
      return true;
    };

    if (!tryAttach()) {
      pollId = setInterval(() => {
        if (tryAttach() && pollId !== undefined) {
          clearInterval(pollId);
          pollId = undefined;
        }
      }, ATTACH_POLL_MS);
    }

    return () => {
      cancelled = true;
      if (pollId !== undefined) clearInterval(pollId);
      detach();
    };
  }, [getPlayer]);

  const onTogglePause = useCallback(async () => {
    const player = getPlayer();
    if (!player) return;

    if (player.paused) {
      void player.play();
    } else {
      player.pause();
    }
  }, [getPlayer]);

  return [paused, onTogglePause];
}

export default usePaused;
