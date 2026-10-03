import { useEffect, useMemo, useState } from "react";
import { useMedia } from "@videojs/react";
import type { VideoJsTextTrackList } from "$types/videoJsPlayer";
import type { VideoMedia } from "$utils/video/media";
import { isVideoMedia } from "$utils/video/media";
import { parseWebVtt, type ParsedVttCue } from "./parseWebVtt";

type TrackSource = {
  kind: "subtitles";
  src: string;
  srclang: string;
  label: string;
};

type LoadedTrack = TrackSource & {
  cues: ParsedVttCue[];
  textTrack: TextTrack;
};

type MediaEngine = {
  setOption?: (module: string, option: string, value: unknown) => void;
  unloadModule?: (module: string) => void;
  addEventListener?: (
    event: string,
    listener: (...args: unknown[]) => void
  ) => void;
  removeEventListener?: (
    event: string,
    listener: (...args: unknown[]) => void
  ) => void;
  disableTextTrack?: () => Promise<void> | void;
};

function canUseNativeTextTracks(media: VideoMedia): boolean {
  return (
    typeof (media as { addTextTrack?: unknown }).addTextTrack === "function"
  );
}

function getMediaEngine(media: VideoMedia): MediaEngine | null {
  const engine = (media as { engine?: unknown }).engine;
  if (!engine || typeof engine !== "object") return null;
  return engine as MediaEngine;
}

/** iframe 側のネイティブ字幕を消し、外部 VTT オーバーレイと二重表示しない */
function disableProviderNativeCaptions(media: VideoMedia): void {
  const engine = getMediaEngine(media);
  if (!engine) return;

  try {
    // YouTube IFrame API（空 track で選択解除）
    engine.setOption?.("captions", "track", {});
  } catch {
    // ignore
  }

  try {
    // 自動生成字幕などが残る場合にモジュール自体を外す
    engine.unloadModule?.("captions");
    engine.unloadModule?.("cc");
  } catch {
    // ignore
  }

  try {
    // Vimeo Player API
    void engine.disableTextTrack?.();
  } catch {
    // ignore
  }
}

function disableAllTracks(textTracks: TextTrackList | undefined): void {
  if (!textTracks) return;
  for (let i = 0; i < textTracks.length; i++) {
    const track = textTracks[i];
    if (track && track.mode !== "disabled") {
      track.mode = "disabled";
    }
  }
}

function toTrackSources(
  tracks: VideoJsTextTrackList | undefined
): TrackSource[] {
  if (!tracks?.length) return [];
  return Array.from(tracks, (track) =>
    track?.src
      ? {
          kind: "subtitles" as const,
          src: track.src,
          srclang: track.srclang,
          label: track.label,
        }
      : null
  ).filter((track): track is TrackSource => track != null);
}

async function fetchVttCues(src: string): Promise<ParsedVttCue[]> {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to fetch VTT: ${response.status}`);
  }
  return parseWebVtt(await response.text());
}

/**
 * YouTube / Vimeo など iframe 系 media に外部 VTT を載せる。
 * textTracks を差し替え、CaptionsButton / 学習ログと接続する。
 */
export function useRemoteTextTracks(tracks: VideoJsTextTrackList | undefined): {
  media: VideoMedia | null;
  loadedTracks: LoadedTrack[];
} {
  const media = useMedia();
  const [loadedTracks, setLoadedTracks] = useState<LoadedTrack[]>([]);
  const trackSources = useMemo(() => toTrackSources(tracks), [tracks]);
  const trackKey = trackSources
    .map((track) => `${track.src}\t${track.srclang}\t${track.label}`)
    .join("\0");

  useEffect(() => {
    if (!isVideoMedia(media) || trackSources.length === 0) {
      setLoadedTracks([]);
      return;
    }

    // HLS など HTML video は <track> 子要素でネイティブ対応する
    if (canUseNativeTextTracks(media)) {
      setLoadedTracks([]);
      return;
    }

    const host = document.createElement("video");
    host.crossOrigin = "anonymous";
    host.muted = true;
    host.playsInline = true;
    host.setAttribute("aria-hidden", "true");
    host.style.display = "none";
    document.body.appendChild(host);

    const mediaRecord = media as object;
    // Video.js textTrack feature が attach 時に掴んだ list へ change を転送する
    const providerTextTracks = media.textTracks;
    const previousTextTracks = Object.getOwnPropertyDescriptor(
      mediaRecord,
      "textTracks"
    );
    const previousAddTextTrack = Object.getOwnPropertyDescriptor(
      mediaRecord,
      "addTextTrack"
    );

    disableAllTracks(providerTextTracks);
    disableProviderNativeCaptions(media);

    const onProviderApiChange = () => {
      disableAllTracks(providerTextTracks);
      disableProviderNativeCaptions(media);
    };
    const engine = getMediaEngine(media);
    engine?.addEventListener?.("onApiChange", onProviderApiChange);
    media.addEventListener("play", onProviderApiChange);

    Object.defineProperty(mediaRecord, "textTracks", {
      configurable: true,
      enumerable: true,
      get: () => host.textTracks,
    });
    Object.defineProperty(mediaRecord, "addTextTrack", {
      configurable: true,
      enumerable: true,
      value: (kind: TextTrackKind, label?: string, language?: string) =>
        host.addTextTrack(kind, label, language),
    });

    const forwardTrackListEvent = (type: string) => {
      providerTextTracks?.dispatchEvent(new Event(type));
    };

    const onHostTrackListEvent = (event: Event) => {
      forwardTrackListEvent(event.type);
      media.dispatchEvent(new Event("texttrackchange"));
      // 選択変更時も provider ネイティブ字幕を抑止（二重表示防止）
      disableProviderNativeCaptions(media);
    };

    host.textTracks.addEventListener("change", onHostTrackListEvent);
    host.textTracks.addEventListener("addtrack", onHostTrackListEvent);
    host.textTracks.addEventListener("removetrack", onHostTrackListEvent);

    let cancelled = false;
    const sources = trackSources;
    // engine 準備前の setOption / disableTextTrack を取りこぼさないよう短時間再試行
    let disableAttempts = 0;
    const disableTimer = window.setInterval(() => {
      if (cancelled || disableAttempts >= 15) {
        window.clearInterval(disableTimer);
        return;
      }
      disableAttempts += 1;
      disableProviderNativeCaptions(media);
    }, 500);

    void (async () => {
      const next: LoadedTrack[] = [];

      for (const track of sources) {
        try {
          const cues = await fetchVttCues(track.src);
          if (cancelled) return;

          const textTrack = host.addTextTrack(
            track.kind,
            track.label,
            track.srclang
          );
          for (const cue of cues) {
            textTrack.addCue(new VTTCue(cue.startTime, cue.endTime, cue.text));
          }
          textTrack.mode = "hidden";
          next.push({ ...track, cues, textTrack });
        } catch {
          // 個別トラックの読み込み失敗は他トラックに影響させない
        }
      }

      if (!cancelled) {
        setLoadedTracks(next);
        disableProviderNativeCaptions(media);
        host.textTracks.dispatchEvent(new Event("change"));
        media.dispatchEvent(new Event("texttrackchange"));
      }
    })();

    return () => {
      cancelled = true;
      window.clearInterval(disableTimer);
      setLoadedTracks([]);

      engine?.removeEventListener?.("onApiChange", onProviderApiChange);
      media.removeEventListener("play", onProviderApiChange);

      host.textTracks.removeEventListener("change", onHostTrackListEvent);
      host.textTracks.removeEventListener("addtrack", onHostTrackListEvent);
      host.textTracks.removeEventListener("removetrack", onHostTrackListEvent);

      if (previousTextTracks) {
        Object.defineProperty(mediaRecord, "textTracks", previousTextTracks);
      } else {
        Reflect.deleteProperty(mediaRecord, "textTracks");
      }

      if (previousAddTextTrack) {
        Object.defineProperty(
          mediaRecord,
          "addTextTrack",
          previousAddTextTrack
        );
      } else {
        Reflect.deleteProperty(mediaRecord, "addTextTrack");
      }

      host.remove();
    };
  }, [media, trackKey, trackSources]);

  return {
    media: isVideoMedia(media) ? media : null,
    loadedTracks,
  };
}
