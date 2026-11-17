import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { useMedia } from "@videojs/react";
import { isVideoMedia } from "$utils/video/media";

const OFF_LABEL = "サブタイトル オフ";

const visuallyHiddenSx: SxProps<Theme> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function isCaptionOrSubtitle(track: TextTrack): boolean {
  return track.kind === "captions" || track.kind === "subtitles";
}

function getSelectedCaptionsLabel(
  textTracks: TextTrackList | undefined
): string {
  if (!textTracks) return OFF_LABEL;

  for (let i = 0; i < textTracks.length; i++) {
    const track = textTracks[i];
    if (track && isCaptionOrSubtitle(track) && track.mode === "showing") {
      return track.label || track.language || "字幕";
    }
  }

  return OFF_LABEL;
}

/**
 * 字幕言語の変更を live region で読み上げる。
 * StatusAnnouncer は ON/OFF のみのため、言語切替（例: 日本語→English）を補完する。
 */
function CaptionsLanguageAnnouncer() {
  const media = useMedia();
  const [announcement, setAnnouncement] = useState("");
  const previousLabelRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isVideoMedia(media)) {
      previousLabelRef.current = null;
      return;
    }

    const sync = () => {
      const label = getSelectedCaptionsLabel(media.textTracks);
      if (previousLabelRef.current === null) {
        previousLabelRef.current = label;
        return;
      }
      if (previousLabelRef.current === label) return;
      previousLabelRef.current = label;
      setAnnouncement(label);
    };

    const onTrackListEvent = () => sync();
    sync();

    media.textTracks?.addEventListener("change", onTrackListEvent);
    media.addEventListener("texttrackchange", onTrackListEvent);

    return () => {
      media.textTracks?.removeEventListener("change", onTrackListEvent);
      media.removeEventListener("texttrackchange", onTrackListEvent);
    };
  }, [media]);

  return (
    <Box
      component="div"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      sx={visuallyHiddenSx}
    >
      {announcement}
    </Box>
  );
}

export default CaptionsLanguageAnnouncer;
