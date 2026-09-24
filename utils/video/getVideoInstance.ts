import type { OembedSchema } from "$server/models/oembed";
import type { VideoResourceSchema } from "$server/models/videoResource";
import type { VideoInstance } from "$types/videoInstance";
import buildTracks from "$utils/buildTracks";
import getVideoType from "./getVideoType";

function createVideoInstance(
  type: VideoInstance["type"],
  url: string,
  options?: {
    poster?: OembedSchema["thumbnail_url"];
    tracks?: VideoInstance["tracks"];
  }
): VideoInstance {
  return {
    type,
    url,
    media: null,
    poster: options?.poster,
    tracks: options?.tracks,
    stopTimeOver: false,
    firstPlay: true,
  };
}

/**
 * 動画プレイヤーのインスタンスを生成
 * @param resource VideoResourceSchema
 * @returns プレイヤーインスタンス（media はマウント後に設定）
 */
function getVideoInstance(
  resource: Pick<
    VideoResourceSchema,
    "providerUrl" | "url" | "accessToken" | "tracks"
  >,
  thumbnailUrl?: OembedSchema["thumbnail_url"]
): VideoInstance {
  switch (getVideoType(resource.providerUrl)) {
    case "youtube":
      return createVideoInstance("youtube", resource.url, {
        tracks: buildTracks(resource.tracks),
      });
    case "vimeo":
      return createVideoInstance("vimeo", resource.url);
    default: {
      const url = `${resource.url}?accessToken=${resource.accessToken}`;
      return createVideoInstance("wowza", url, {
        poster: thumbnailUrl,
        tracks: buildTracks(resource.tracks),
      });
    }
  }
}

export default getVideoInstance;
export { createVideoInstance };
