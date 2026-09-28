import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { VideoPlayer as VideoJsPlayer, VideoSkin } from "@videojs/react/video";
import { HlsJsVideo } from "@videojs/react/media/hlsjs-video";
import { YouTubeVideo } from "@videojs/react/media/youtube-video";
import { VimeoVideo } from "@videojs/react/media/vimeo-video";
import type { VideoJsTextTrackList } from "$types/videoJsPlayer";
import type { VideoMedia } from "$utils/video/media";
import { useMediaBind } from "$utils/video/useMediaBind";
import SeekButtons from "./SeekButtons";

const containerSx: SxProps<Theme> = {
  position: "relative",
  width: "100%",
  aspectRatio: "16 / 9",
  // Video.js デフォルトスキンは --media-border-radius: 2rem
  "& .media-default-skin, & .video-skin": {
    "--media-border-radius": "0",
  },
  "& video, & iframe": {
    width: "100%",
    height: "100%",
  },
  "& .chibichilo-seek-slot": {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    gap: "1px",
  },
  "& .chibichilo-seek-button-icon": {
    fontSize: "1.25rem",
  },
  "& .chibichilo-seek-button-icon-forward": {
    scale: "-1 1",
  },
};

export type VideoMediaKind = "hls" | "youtube" | "vimeo";

type Props = {
  src: string;
  kind: VideoMediaKind;
  poster?: string;
  tracks?: VideoJsTextTrackList;
  onMediaChange?: (media: VideoMedia | null) => void;
};

function ProviderMedia({
  kind,
  src,
  tracks,
}: Pick<Props, "kind" | "src" | "tracks">) {
  if (kind === "youtube") {
    return <YouTubeVideo src={src} playsInline />;
  }
  if (kind === "vimeo") {
    return <VimeoVideo src={src} playsInline />;
  }
  return (
    <HlsJsVideo src={src} playsInline crossOrigin="anonymous">
      {tracks?.map((track, index) => (
        <track
          key={`${track.srclang}-${index}`}
          kind={track.kind}
          src={track.src}
          srcLang={track.srclang}
          label={track.label}
        />
      ))}
    </HlsJsVideo>
  );
}

function MediaBinder({
  onMediaChange,
}: {
  onMediaChange?: (media: VideoMedia | null) => void;
}) {
  useMediaBind(onMediaChange);
  return null;
}

/** Video.js プレイヤー本体 */
function Video({ src, kind, poster, tracks, onMediaChange }: Props) {
  return (
    <Box sx={containerSx}>
      <VideoJsPlayer poster={poster}>
        <MediaBinder onMediaChange={onMediaChange} />
        <VideoSkin>
          <ProviderMedia kind={kind} src={src} tracks={tracks} />
          <SeekButtons />
        </VideoSkin>
      </VideoJsPlayer>
    </Box>
  );
}

export default Video;
