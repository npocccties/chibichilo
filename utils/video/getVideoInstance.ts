import type { VideoResourceSchema } from "$server/models/videoResource";
import type { VideoInstance } from "$types/videoInstance";
import buildTracks from "$utils/buildTracks";
import getVideoJsPlayer from "./getVideoJsPlayer";
import getVimeoPlayer from "./getVimeoPlayer";

/**
 * 動画プレイヤーのインスタンスを生成
 * @param resource VideoResourceSchema
 * @param autoplay インスタンス生成時に自動再生するか否か
 * @returns プレイヤーのHTML要素、インスタンス、video.jsであれば字幕トラック
 */
function getVideoInstance(
  resource: Pick<VideoResourceSchema, "providerUrl" | "url" | "tracks">,
  autoplay = false
): Promise<VideoInstance> {
  return new Promise((resolve) => {
    switch (resource.providerUrl) {
      case "https://www.youtube.com/": {
        const { element, player } = getVideoJsPlayer({
          techOrder: ["youtube"],
          sources: [
            {
              type: "video/youtube",
              src: resource.url,
            },
          ],
          autoplay,
        });
        player.ready(() => {
          resolve({
            type: "youtube",
            url: resource.url,
            element,
            player,
            tracks: buildTracks(resource.tracks),
          });
        });
        break;
      }
      case "https://vimeo.com/": {
        const { element, player } = getVimeoPlayer({
          url: resource.url,
          autoplay,
        });
        player.ready().then(() => {
          resolve({
            type: "vimeo",
            url: resource.url,
            element,
            player,
          });
        });
        break;
      }
      default: {
        const { element, player } = getVideoJsPlayer({
          sources: [
            { type: "application/vnd.apple.mpegurl", src: resource.url },
          ],
          autoplay,
        });
        player.ready(() => {
          resolve({
            type: "wowza",
            url: resource.url,
            element,
            player,
            tracks: buildTracks(resource.tracks),
          });
        });
        break;
      }
    }
  });
}

export default getVideoInstance;
