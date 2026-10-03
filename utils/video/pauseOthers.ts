import type { VideoInstance } from "$types/videoInstance";
import { safePause } from "$utils/video/media";

/** 現在トピック以外のプレイヤー再生を停止する */
export function pauseOtherVideos(
  video: Map<string, VideoInstance>,
  currentId: string
): void {
  for (const [id, instance] of video.entries()) {
    if (id === currentId) continue;
    safePause(instance.media);
  }
}
