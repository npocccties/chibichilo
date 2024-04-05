import type { VideoInstance } from "$types/videoInstance";

/**
 * 動画プロバイダーの識別子をVideo種別に変換
 * @param providerUrl 動画プロバイダーの識別子
 * @return Video種別
 */
function getVideoType(providerUrl: string | null): VideoInstance["type"] {
  switch (providerUrl) {
    case "https://www.youtube.com/":
      return "youtube";
    case "https://vimeo.com/":
      return "vimeo";
    default:
      return "wowza";
  }
}

export default getVideoType;
