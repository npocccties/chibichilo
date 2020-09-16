import ISO6391 from "iso-639-1";
import { postForm, textFetcher } from "../api";

export const createSubtitle = (videoId: VideoSchema["id"]) => (
  subtitle: Subtitle
) => {
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

export function destroySubtitle(id: Subtitle["id"]) {
  if (id == null || !Number.isFinite(id)) return Promise.resolve();
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_subtitle_delete.php`;
  const req: DestroySubtitleRequest = {
    subtitleid: id.toString(),
  };
  return textFetcher(url, postForm(req));
}
type DestroySubtitleRequest = {
  subtitleid: string;
};

function buildTrack(
  subtitle: Subtitle
): { kind: "subtitles"; src: string; srclang: string; label: string } {
  let src;
  if (subtitle.file.size === 0)
    src = `${process.env.NEXT_PUBLIC_SUBTITLE_STORE_PATH}/${subtitle.file.name}`;
  else src = URL.createObjectURL(subtitle.file);
  return {
    kind: "subtitles",
    src,
    srclang: subtitle.lang,
    label: ISO6391.getNativeName(subtitle.lang),
  };
}

export function buildTracks(subtitles: Subtitle[]) {
  return subtitles.map(buildTrack);
}
