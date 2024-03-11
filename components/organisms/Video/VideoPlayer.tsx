import { useEffect } from "react";
import VimeoPlayer from "@vimeo/player";
import type { SxProps } from "@mui/system";
import type { VideoInstance } from "$types/videoInstance";
import Box from "@mui/material/Box";
import { usePlayerState } from "$store/player";
import Vimeo from "./Vimeo";
import VideoJs from "./VideoJs";
import videoJsDurationChangeShims from "$utils/videoJsDurationChangeShims";

type Props = {
  sx?: SxProps;
  className?: string;
  videoInstance: VideoInstance;
  autoplay?: boolean;
  onEnded?: () => void;
  onDurationChange?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
};

export default function VideoPlayer({
  videoInstance,
  autoplay = false,
  onEnded,
  onDurationChange,
  onTimeUpdate,
  ...other
}: Props) {
  usePlayerState(videoInstance.player);

  useEffect(() => {
    if (!autoplay) return;
    const player = videoInstance.player;
    const play = async () => {
      try {
        await player.play();
      } catch {
        // nop
      }
    };
    // NOTE: videojs-youtube において再生されない不具合があるので play イベントが発火されなければ再実行を試みる
    const timeout = setTimeout(() => play(), 1_000);
    player.on("play", () => clearTimeout(timeout));
    const ready =
      player instanceof VimeoPlayer
        ? player.ready()
        : new Promise((resolve) => player.ready(() => resolve(undefined)));
    void ready.then(play);
    return () => clearTimeout(timeout);
  }, [
    videoInstance,
    autoplay,
    // NOTE: セクションが切り替わったことを検知する目的でonEndedの変更検知を利用している
    onEnded,
  ]);
  useEffect(() => {
    const { player } = videoInstance;
    const handleEnded = () => onEnded?.();
    const handleDurationChange = ({ duration }: { duration: number }) => {
      onDurationChange?.(duration);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTimeUpdate = (event: any) => {
      const currentTime =
        event?.seconds || event?.target?.player?.currentTime?.();
      if (Number.isFinite(currentTime)) onTimeUpdate?.(currentTime);
    };

    player.on("ended", handleEnded);
    player.on("durationchange", handleDurationChange);
    player.on("timeupdate", handleTimeUpdate);
    if (videoInstance.type !== "vimeo") {
      videoJsDurationChangeShims(videoInstance.player, handleDurationChange);
    }
    return () => {
      player.off("ended", handleEnded);
      player.off("durationchange", handleDurationChange);
      player.off("timeupdate", handleTimeUpdate);
    };
  }, [videoInstance, onEnded, onDurationChange, onTimeUpdate]);

  return (
    <Box {...other}>
      {videoInstance.type === "vimeo" && <Vimeo {...videoInstance} />}
      {videoInstance.type === "youtube" && <VideoJs {...videoInstance} />}
      {videoInstance.type === "wowza" && <VideoJs {...videoInstance} />}
    </Box>
  );
}
