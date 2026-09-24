import type { VideoJsTextTrackList } from "$types/videoJsPlayer";
import type { VideoMedia } from "$utils/video/media";
import { isVideoMedia } from "$utils/video/media";

export type VideoProviderType = "youtube" | "vimeo" | "wowza";

export type VideoInstance = {
  type: VideoProviderType;
  url: string;
  /** Video.js の media。マウント後に設定される */
  media: VideoMedia | null;
  poster?: string;
  tracks?: VideoJsTextTrackList;
  stopTimeOver: boolean;
  /** 初回再生 */
  firstPlay: boolean;
};

export type ChibichiloPlayer = VideoMedia;

export function getMediaFromVideoInstance(
  instance: VideoInstance
): VideoMedia | null {
  return instance.media;
}

/** @deprecated Use getMediaFromVideoInstance */
export function getPlayerFromVideoInstance(
  instance: VideoInstance
): VideoMedia | null {
  return getMediaFromVideoInstance(instance);
}

export function isYouTubeInstance(instance: VideoInstance): boolean {
  return instance.type === "youtube";
}

export function isChibichiloPlayer(
  player: unknown
): player is ChibichiloPlayer {
  return isVideoMedia(player);
}

/** @deprecated Use isChibichiloPlayer */
export const isVideoJsLikePlayer = isChibichiloPlayer;
