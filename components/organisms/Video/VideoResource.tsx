import { useEffect, useMemo } from "react";
import type { SxProps } from "@mui/system";
import type { VideoResourceSchema } from "$server/models/videoResource";
import VideoPlayer from "./VideoPlayer";
import getVideoInstance from "$utils/video/getVideoInstance";
import { useVideoAtom } from "$store/video";
import type { OembedSchema } from "$server/models/oembed";

type Props = Pick<
  VideoResourceSchema,
  "providerUrl" | "url" | "accessToken" | "tracks"
> & {
  sx?: SxProps;
  className?: string;
  onEnded?: () => void;
  onDurationChange?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  identifier: string; // トピック編集時はURL、それ以外の再生時はtopic.id
  autoplay?: boolean;
  thumbnailUrl?: OembedSchema["thumbnail_url"];
};

export default function VideoResource({
  providerUrl,
  url,
  accessToken,
  tracks,
  identifier,
  autoplay = false,
  thumbnailUrl,
  ...other
}: Props) {
  const videoInstance = useMemo(() => {
    return getVideoInstance({
      providerUrl,
      url,
      accessToken,
      tracks,
      autoplay,
      thumbnailUrl,
    });
  }, [providerUrl, url, accessToken, tracks, autoplay, thumbnailUrl]);

  const { video } = useVideoAtom();
  useEffect(() => {
    video.set(identifier, videoInstance);
  }, [video, identifier, videoInstance]);

  return <VideoPlayer videoInstance={videoInstance} {...other} />;
}
