import { postForm, textFetcher } from "../api";

export type Subtitle = {
  id?: number;
  file: File; // NOTE: WebVTT file
  lang: string; // NOTE: ISO 639-1 code
};

export const createSubtitle = (videoId: number) => (subtitle: Subtitle) => {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_subtitle.php`;
  const req: CreateVideoSubtitleRequest = {
    id: videoId.toString(),
    lang: subtitle.lang,
    file: subtitle.file,
  };
  if (subtitle.file.size > 0) return textFetcher(url, postForm(req));
  else return Promise.resolve("");
};
type CreateVideoSubtitleRequest = {
  id: string; // NOTE: videoId
  lang: string;
  file: File;
};

export function destroySubtitle(id: number) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_subtitle_delete.php`;
  const req: DestroySubtitleRequest = {
    subtitleid: id.toString(),
  };
  return textFetcher(url, postForm(req));
}
type DestroySubtitleRequest = {
  subtitleid: string;
};
