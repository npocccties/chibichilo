import type { VideoJsTextTrackList } from "$types/videoJsPlayer";

/** Video.js の useMedia() が返す再生面 */
export type VideoMedia = {
  play(): void | Promise<void>;
  pause(): void;
  paused: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  muted: boolean;
  seeking: boolean;
  readyState: number;
  played?: TimeRanges;
  textTracks?: TextTrackList;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
};

export function isVideoMedia(value: unknown): value is VideoMedia {
  return (
    !!value &&
    typeof value === "object" &&
    "currentTime" in value &&
    "addEventListener" in value &&
    typeof (value as VideoMedia).addEventListener === "function" &&
    typeof (value as VideoMedia).play === "function"
  );
}

export function whenMediaReady(
  media: VideoMedia,
  callback: () => void
): () => void {
  if (media.readyState >= 1) {
    callback();
    return () => undefined;
  }

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    media.removeEventListener("loadedmetadata", finish);
    media.removeEventListener("canplay", finish);
    callback();
  };

  media.addEventListener("loadedmetadata", finish);
  media.addEventListener("canplay", finish);
  return () => {
    done = true;
    media.removeEventListener("loadedmetadata", finish);
    media.removeEventListener("canplay", finish);
  };
}

export function getMediaTextTracks(media: VideoMedia): VideoJsTextTrackList {
  return (media.textTracks ??
    createEmptyTextTrackList()) as VideoJsTextTrackList;
}

function createEmptyTextTrackList(): TextTrackList {
  const list = [] as unknown as TextTrackList;
  Object.defineProperty(list, "length", { value: 0 });
  list.addEventListener = () => undefined;
  list.removeEventListener = () => undefined;
  return list;
}
