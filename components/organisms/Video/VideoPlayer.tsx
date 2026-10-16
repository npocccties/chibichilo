import { lazy, Suspense, useCallback, useState } from "react";
import type { SxProps } from "@mui/system";
import type { VideoInstance } from "$types/videoInstance";
import type { VideoMedia } from "$utils/video/media";
import { useVideoPlayback } from "$utils/video/useVideoPlayback";
import Box from "@mui/material/Box";
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

  useVideoPlayback({
    media,
    videoInstance,
    active: !hidden,
    autoplay,
    startTime,
    stopTime,
    onEnded,
    onDurationChange,
    onTimeUpdate,
  });

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
