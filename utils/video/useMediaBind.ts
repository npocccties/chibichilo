import { useEffect } from "react";
import { useMedia } from "@videojs/react";
import type { VideoMedia } from "$utils/video/media";
import { isVideoMedia } from "$utils/video/media";
import { useLatestRef } from "./useLatestRef";

/** Player 内の media を外側へ結びつける */
export function useMediaBind(
  onMediaChange?: (media: VideoMedia | null) => void
): void {
  const media = useMedia();
  const onMediaChangeRef = useLatestRef(onMediaChange);

  useEffect(() => {
    const onMediaChange = onMediaChangeRef.current;
    const next = isVideoMedia(media) ? media : null;
    onMediaChange?.(next);
    return () => {
      onMediaChange?.(null);
    };
  }, [media, onMediaChangeRef]);
}
