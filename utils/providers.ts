import { NEXT_PUBLIC_API_BASE_PATH } from "./env";

/** サポートしている動画配信サービス一覧 */
export const providers = {
  youtube: {
    name: "YouTube",
    baseUrl: "https://www.youtube.com/watch?v=",
  },
  vimeo: {
    name: "Vimeo",
    baseUrl: "https://vimeo.com/",
  },
  wowza: {
    name: "Wowza",
    baseUrl: `${NEXT_PUBLIC_API_BASE_PATH}/api/v2/wowza/`,
  },
} as const;

export default providers;
