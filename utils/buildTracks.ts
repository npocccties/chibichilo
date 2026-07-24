import ISO6391 from "iso-639-1";
import type { VideoTrackSchema } from "$server/models/videoTrack";
import type { VideoJsTextTrackList } from "$types/videoJsPlayer";
import { NEXT_PUBLIC_API_BASE_PATH } from "$utils/env";

function buildTrack({ url, language, accessToken }: VideoTrackSchema): {
  kind: "subtitles";
  src: string;
  srclang: string;
  label: string;
} {
  return {
    kind: "subtitles",
    src: /^blob:/i.test(url)
      ? url
      : `${NEXT_PUBLIC_API_BASE_PATH}${url}?accessToken=${accessToken}`,
    srclang: language,
    label: ISO6391.getNativeName(language),
  };
}

function buildTracks(tracks: VideoTrackSchema[]) {
  return tracks.map(buildTrack) as VideoJsTextTrackList;
}

export default buildTracks;
