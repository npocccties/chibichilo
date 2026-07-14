import { useCallback, useEffect, useState } from "react";
import type { VideoJsPlayer } from "$types/videoJsPlayer";
import VimeoPlayer from "@vimeo/player";

/** メディア要素を一時停止しているかどうか */
function usePaused(
  getPlayer: () =>
    | VideoJsPlayer
    | VimeoPlayer
    | HTMLVideoElement
    | null
    | undefined
): [boolean, () => void] {
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const player = getPlayer();
    if (!player) return;

    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);

    if (player instanceof HTMLVideoElement) {
      player.addEventListener("play", onPlay);
      player.addEventListener("pause", onPause);
      player.addEventListener("ended", onPause);
      return () => {
        player.removeEventListener("play", onPlay);
        player.removeEventListener("pause", onPause);
        player.removeEventListener("ended", onPause);
      };
    }

    player.on("play", onPlay);
    player.on("pause", onPause);
    player.on("ended", onPause);
    return () => {
      player.off("play", onPlay);
      player.off("pause", onPause);
      player.off("ended", onPause);
    };
  }, [getPlayer, setPaused]);

  const onTogglePause = useCallback(async () => {
    const player = getPlayer();
    if (!player) return;

    const isPaused: boolean =
      player instanceof HTMLVideoElement
        ? player.paused
        : player instanceof VimeoPlayer
          ? await player.getPaused()
          : player.paused();

    if (isPaused) {
      void player.play();
    } else {
      void player.pause();
    }
  }, [getPlayer]);

  return [paused, onTogglePause];
}

export default usePaused;
