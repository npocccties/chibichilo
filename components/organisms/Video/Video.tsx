import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { I18nProvider } from "@videojs/react/i18n";
import { VideoPlayer as VideoJsPlayer, VideoSkin } from "@videojs/react/video";
import { HlsJsVideo } from "@videojs/react/media/hlsjs-video";
import { YouTubeVideo } from "@videojs/react/media/youtube-video";
import { VimeoVideo } from "@videojs/react/media/vimeo-video";
import type { VideoJsTextTrackList } from "$types/videoJsPlayer";
import type { VideoMedia } from "$utils/video/media";
import { useMediaBind } from "$utils/video/useMediaBind";
import CaptionsLanguageAnnouncer from "./CaptionsLanguageAnnouncer";
import CaptionsMenu from "./CaptionsMenu";
import FullWindowButton, { FALLBACK_ATTR } from "./FullWindowButton";
import PlaybackRateMenu from "./PlaybackRateMenu";
import RemoteSubtitles from "./RemoteSubtitles";
import SeekButtons from "./SeekButtons";

const containerSx: SxProps<Theme> = {
  position: "relative",
  width: "100%",
  aspectRatio: "16 / 9",
  // 5cqh で字幕サイズをプレイヤー高さ基準にする（v8 vtt.js 相当）
  containerType: "size",
  // Video.js デフォルトスキンは --media-border-radius: 2rem
  "& .media-default-skin, & .video-skin": {
    "--media-border-radius": "0",
  },
  "& video, & iframe": {
    width: "100%",
    height: "100%",
  },
  // iframe がクリック・タップを吸収するとスキンのジェスチャー（再生/停止、コントロール表示）が働かない
  "& iframe": {
    pointerEvents: "none",
  },
  // タッチ端末では YouTube 側の再生/停止ボタンを使えるよう、タップを iframe へ通す
  "@media (hover: none) and (pointer: coarse)": {
    "& .chibichilo-youtube iframe": {
      pointerEvents: "auto",
    },
  },
  // HLS ネイティブ <track> も v8 デフォルト見た目に寄せる
  "& video::cue": {
    color: "rgba(255, 255, 255, 1)",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    fontFamily: "sans-serif",
    fontSize: "5cqh",
    textShadow: "none",
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
  "& .chibichilo-captions-slot, & .chibichilo-playback-rate-slot, & .chibichilo-full-window-slot":
    {
      display: "contents",
    },
  [`& [${FALLBACK_ATTR}] .media-fullscreen-button`]: {
    display: "none",
  },
  "&.chibichilo-full-window": {
    position: "fixed",
    inset: 0,
    zIndex: "modal",
    width: "auto",
    aspectRatio: "auto",
    backgroundColor: "black",
    "& .video-skin": {
      width: "100%",
      height: "100%",
    },
  },
  // 0.75x / 1.75x でも窮屈にならないよう小さめ・固定幅で統一
  "& .chibichilo-playback-rate-button": {
    boxSizing: "border-box",
    minWidth: "3.25em",
    height: "2em",
    paddingInline: "0.4em",
    fontSize: "0.7rem",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  "& .chibichilo-playback-rate-menu .media-menu-radio-item": {
    fontSize: "0.8rem",
    fontVariantNumeric: "tabular-nums",
  },
  "& .chibichilo-captions-menu .media-menu-content": {
    minWidth: "10em",
  },
};

export type VideoMediaKind = "hls" | "youtube" | "vimeo";

// Wowza の URL は `.mp4` で終わるが、応答は HLS プレイリスト。
// 拡張子のままだとネイティブ再生になり、Firefox は HLS を再生できない。
const HLS_SOURCE_TYPE = "application/vnd.apple.mpegurl";

type Props = {
  src: string;
  kind: VideoMediaKind;
  poster?: string;
  tracks?: VideoJsTextTrackList;
  onMediaChange?: (media: VideoMedia | null) => void;
};

function TrackElements({ tracks }: { tracks?: VideoJsTextTrackList }) {
  if (!tracks?.length) return null;

  return (
    <>
      {Array.from({ length: tracks.length }, (_, index) => {
        const track = tracks[index];
        if (!track?.src) return null;
        return (
          <track
            key={`${track.srclang}-${index}`}
            kind={track.kind}
            src={track.src}
            srcLang={track.srclang}
            label={track.label}
          />
        );
      })}
    </>
  );
}

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
  return <HlsSource src={src} tracks={tracks} />;
}

function HlsSource({ src, tracks }: Pick<Props, "src" | "tracks">) {
  const source = useMemo(() => ({ src, type: HLS_SOURCE_TYPE }), [src]);

  return (
    <HlsJsVideo source={source} playsInline crossOrigin="anonymous">
      <TrackElements tracks={tracks} />
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
  const needsRemoteSubtitles = kind === "youtube" || kind === "vimeo";
  const [fullWindow, setFullWindow] = useState(false);

  return (
    <Box
      sx={containerSx}
      className={fullWindow ? "chibichilo-full-window" : undefined}
    >
      <I18nProvider locale="ja">
        <VideoJsPlayer poster={poster}>
          <MediaBinder onMediaChange={onMediaChange} />
          <VideoSkin
            className={kind === "youtube" ? "chibichilo-youtube" : undefined}
          >
            <ProviderMedia kind={kind} src={src} tracks={tracks} />
            {needsRemoteSubtitles && <RemoteSubtitles tracks={tracks} />}
            <CaptionsLanguageAnnouncer />
            <SeekButtons />
            <CaptionsMenu />
            <PlaybackRateMenu />
            {kind !== "hls" && (
              <FullWindowButton
                active={fullWindow}
                onToggle={() => setFullWindow((active) => !active)}
              />
            )}
          </VideoSkin>
        </VideoJsPlayer>
      </I18nProvider>
    </Box>
  );
}

export default Video;
