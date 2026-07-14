import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { VideoJsInstance } from "$types/videoInstance";

type Props = Omit<VideoJsInstance, "type" | "url">;

const videoJsSx: SxProps<Theme> = {
  // NOTE: Video.jsのエラーメッセージを読みやすくする目的
  "& .vjs-modal-dialog-content": {
    fontSize: "1.5rem !important",
  },
  // NOTE: iframe 内で再生ボタンが機能しない問題への対処と見た目の調整を図る目的
  //       See also https://github.com/npocccties/chibichilo/issues/373
  "& .vjs-youtube .vjs-poster": {
    display: "none !important",
  },
  "& .vjs-youtube .vjs-loading-spinner": {
    display: "none !important",
  },
  "& .vjs-youtube .vjs-big-play-button": {
    display: "none !important",
  },
};

function VideoJs({ element, player, tracks }: Props) {
  const ref = useRef(document.createElement("div"));
  useEffect(() => {
    const { current } = ref;
    element.classList.add("vjs-big-play-centered");
    current.appendChild(element);
    return () => {
      // TODO: played() に失敗するので dispose() せず一時停止して保持
      //       メモリリークにつながるので避けたほうが望ましい
      player.pause();
      element.classList.remove("vjs-big-play-centered");
      current.removeChild(element);
    };
  }, [element, player]);
  useEffect(() => {
    if (!tracks || tracks.length === 0) return;
    const trackElements: HTMLTrackElement[] = [];
    player.ready(() => {
      (tracks ?? [])
        .map(
          (track) =>
            track &&
            (player.addRemoteTextTrack(
              track,
              false
            ) as unknown as HTMLTrackElement)
        )
        .filter(Boolean)
        .forEach((track) => trackElements.push(track));
    });
    return () => {
      player.ready(() => {
        trackElements.forEach((track) => {
          player.removeRemoteTextTrack(track);
        });
      });
    };
  }, [player, tracks]);
  return <Box ref={ref} sx={videoJsSx} />;
}

export default VideoJs;
