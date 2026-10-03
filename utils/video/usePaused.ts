import { useCallback, useEffect, useState } from "react";
import type { VideoMedia } from "$utils/video/media";

type Playable = VideoMedia | HTMLVideoElement;

/** メディア要素を一時停止しているかどうか */
function usePaused(
  getPlayer: () => Playable | null | undefined
): [boolean, () => void] {
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const player = getPlayer();
    if (!player) return;

    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);

    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onPause);
    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onPause);
    };
  }, [getPlayer, setPaused]);

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
