import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { VideoJsTextTrackList } from "$types/videoJsPlayer";
import { getActiveCueText } from "$utils/video/parseWebVtt";
import { useRemoteTextTracks } from "$utils/video/useRemoteTextTracks";

/**
 * Video.js v8 (videojs-vtt.js) のデフォルト字幕スタイルに寄せる。
 * color: rgba(255,255,255,1) / background: rgba(0,0,0,0.8) / font: 5% of height sans-serif
 */
const overlaySx: SxProps<Theme> = {
  position: "absolute",
  left: "5%",
  right: "5%",
  // v8 .vjs-text-track-display の bottom: 3em 相当
  bottom: "3em",
  zIndex: 1,
  pointerEvents: "none",
  color: "rgba(255, 255, 255, 1)",
  fontFamily: "sans-serif",
  // プレイヤー高さの約 5%（vtt.js の FONT_SIZE_PERCENT）
  fontSize: "5cqh",
  lineHeight: 1.25,
  textAlign: "center",
  whiteSpace: "pre-line",
  textShadow: "none",
  "& span": {
    display: "inline",
    padding: "0.1em 0.25em",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 0,
  },
};

type Props = {
  tracks?: VideoJsTextTrackList;
};

/**
 * iframe 系プレイヤー向けの外部 VTT 字幕オーバーレイ。
 * HTML video（HLS）ではネイティブ <track> を使うため何も描画しない。
 */
function RemoteSubtitles({ tracks }: Props) {
  const { media, loadedTracks } = useRemoteTextTracks(tracks);
  const [cueText, setCueText] = useState("");

  useEffect(() => {
    if (!media || loadedTracks.length === 0) {
      setCueText("");
      return;
    }

    const update = () => {
      const showing = loadedTracks.find(
        (track) => track.textTrack.mode === "showing"
      );
      setCueText(
        showing ? getActiveCueText(showing.cues, media.currentTime) : ""
      );
    };

    const onTrackChange = () => update();
    update();

    media.addEventListener("timeupdate", update);
    media.addEventListener("seeked", update);
    media.textTracks?.addEventListener("change", onTrackChange);

    // YouTube 等は timeupdate 間隔が粗いことがあるため補完する
    const timer = window.setInterval(update, 250);

    return () => {
      media.removeEventListener("timeupdate", update);
      media.removeEventListener("seeked", update);
      media.textTracks?.removeEventListener("change", onTrackChange);
      window.clearInterval(timer);
    };
  }, [media, loadedTracks]);

  if (!cueText) return null;

  // 視覚向けオーバーレイ。キュー文言の SR 読み上げはしない
  //（言語切替は CaptionsLanguageAnnouncer、ON/OFF は StatusAnnouncer）
  return (
    <Box
      className="chibichilo-subtitle-overlay"
      sx={overlaySx}
      aria-hidden="true"
    >
      <span>{cueText}</span>
    </Box>
  );
}

export default RemoteSubtitles;
