import type { OembedSchema } from "$server/models/oembed";
import type { VideoResourceSchema } from "$server/models/videoResource";
import type { VideoInstance } from "$types/videoInstance";
import buildTracks from "$utils/buildTracks";
import getVideoJsPlayer from "./getVideoJsPlayer";
import getVideoType from "./getVideoType";
import getVimeoPlayer from "./getVimeoPlayer";

/**
 * 動画プレイヤーのインスタンスを生成
 * @param resource VideoResourceSchema
 * @returns プレイヤーのHTML要素、インスタンス、video.jsであれば字幕トラック
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
      return {
        type: "youtube",
        url: resource.url,
        ...getVideoJsPlayer({
          techOrder: ["youtube"],
          sources: [
            {
              type: "video/youtube",
              src: resource.url,
            },
          ],
        }),
        tracks: buildTracks(resource.tracks),
        stopTimeOver: false,
        firstPlay: true,
      };
    case "vimeo":
      return {
        type: "vimeo",
        url: resource.url,
        ...getVimeoPlayer({ url: resource.url }),
      };
    default: {
      const url = `${resource.url}?accessToken=${resource.accessToken}`;
      return {
        type: "wowza",
        url,
        ...getVideoJsPlayer({
          sources: [{ type: "application/vnd.apple.mpegurl", src: url }],
          poster: thumbnailUrl,
        }),
        tracks: buildTracks(resource.tracks),
        stopTimeOver: false,
        firstPlay: true,
      };
    }
  }
}

export default getVideoInstance;
