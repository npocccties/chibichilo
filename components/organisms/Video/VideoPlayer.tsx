import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import type { SxProps } from "@mui/system";
import type { VideoInstance } from "$types/videoInstance";
import type { VideoMedia } from "$utils/video/media";
import { whenMediaReady } from "$utils/video/media";
import { usePlayerTrackingAtom } from "$store/playerTracker";
import Box from "@mui/material/Box";
import { usePlayerState } from "$store/player";
import type { VideoMediaKind } from "./Video";

const VideoView = lazy(() => import("./Video"));

type Props = {
  sx?: SxProps;
  className?: string;
  videoInstance: VideoInstance;
  autoplay?: boolean;
  hidden?: boolean;
  startTime?: number | null;
  stopTime?: number | null;
  onEnded?: () => void;
  onDurationChange?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
};

const kindByType: Record<VideoInstance["type"], VideoMediaKind> = {
  youtube: "youtube",
  vimeo: "vimeo",
  wowza: "hls",
};

function isValidPlaybackEnd({
  currentTime = 0,
  stopTime,
}: {
  currentTime: number | undefined;
  stopTime: number | null | undefined;
}): boolean {
  return typeof stopTime === "number" && 0 < stopTime && stopTime < currentTime;
}

export default function VideoPlayer({
  videoInstance,
  autoplay = false,
  hidden = false,
  startTime,
  stopTime,
  onEnded,
  onDurationChange,
  onTimeUpdate,
  ...other
}: Props) {
  const [media, setMedia] = useState<VideoMedia | null>(videoInstance.media);
  const handleMediaChange = useCallback(
    (next: VideoMedia | null) => {
      videoInstance.media = next;
      setMedia(next);
    },
    [videoInstance]
  );

  usePlayerState(media);

  useEffect(() => {
    if (!media || !autoplay) return;
    let active = true;
    const play = async () => {
      if (!active) return;
      try {
        await media.play();
      } catch {
        // nop
      }
    };
    const onPlay = () => {
      clearTimeout(timeout);
      media.removeEventListener("play", onPlay);
    };
    // NOTE: 埋め込み系メディアで初回 play が握りつぶされることがあるので再試行する
    const timeout = setTimeout(() => play(), 1_000);
    media.addEventListener("play", onPlay);
    const cancelReady = whenMediaReady(media, () => {
      void play();
    });
    return () => {
      active = false;
      clearTimeout(timeout);
      media.removeEventListener("play", onPlay);
      cancelReady();
    };
  }, [media, autoplay, onEnded]);

  useEffect(() => {
    if (!media) return;
    const handleEnded = () => onEnded?.();
    const handleDurationChange = () => {
      const duration = media.duration;
      if (Number.isFinite(duration) && duration > 0) {
        onDurationChange?.(duration);
      }
    };
    const handleTimeUpdate = () => {
      const currentTime = media.currentTime;
      if (Number.isFinite(currentTime)) onTimeUpdate?.(currentTime);
    };

    media.addEventListener("ended", handleEnded);
    media.addEventListener("durationchange", handleDurationChange);
    media.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      media.removeEventListener("ended", handleEnded);
      media.removeEventListener("durationchange", handleDurationChange);
      media.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [media, onEnded, onDurationChange, onTimeUpdate]);

  useEffect(() => {
    if (!media || hidden) return;

    const handleSeeked = () => {
      const currentTime = media.currentTime;
      if (
        typeof startTime === "number" &&
        Number.isFinite(startTime) &&
        currentTime < startTime
      ) {
        media.currentTime = startTime;
      }
    };

    const handleTimeUpdate = () => {
      if (videoInstance.stopTimeOver) return;
      if (isValidPlaybackEnd({ currentTime: media.currentTime, stopTime })) {
        videoInstance.stopTimeOver = true;
        media.pause();
        onEnded?.();
      }
    };

    const handlePlay = () => {
      // 終了位置より後ろにシークすると、意図せず再生が再開してしまうことがあるので抑制する
      if (videoInstance.stopTimeOver) media.pause();
    };

    const handleFirstPlay = () => {
      if (!videoInstance.firstPlay) return;
      if (typeof startTime === "number" && Number.isFinite(startTime)) {
        media.currentTime = startTime;
      }
      videoInstance.firstPlay = false;
    };

    const cancelReady = whenMediaReady(media, () => {
      if (videoInstance.stopTimeOver) {
        if (typeof startTime === "number" && Number.isFinite(startTime)) {
          media.currentTime = startTime;
        }
        videoInstance.stopTimeOver = false;
      }
      media.addEventListener("timeupdate", handleTimeUpdate);
      media.addEventListener("seeked", handleSeeked);
    });

    media.addEventListener("play", handlePlay);
    media.addEventListener("play", handleFirstPlay, { once: true });

    return () => {
      cancelReady();
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("seeked", handleSeeked);
      media.removeEventListener("play", handlePlay);
      media.removeEventListener("play", handleFirstPlay);
    };
  }, [media, hidden, startTime, stopTime, videoInstance, onEnded]);

  const playerTracking = usePlayerTrackingAtom();

  useEffect(() => {
    if (!media || hidden) return;
    const cancelReady = whenMediaReady(media, () => {
      playerTracking({
        player: media,
        url: videoInstance.url,
        type: videoInstance.type,
      });
    });
    return () => {
      cancelReady();
    };
  }, [media, videoInstance, hidden, playerTracking]);

  return (
    <Box {...other} hidden={hidden}>
      <Suspense fallback={null}>
        <VideoView
          src={videoInstance.url}
          kind={kindByType[videoInstance.type]}
          poster={videoInstance.poster}
          tracks={videoInstance.tracks}
          onMediaChange={handleMediaChange}
        />
      </Suspense>
    </Box>
  );
}
