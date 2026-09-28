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

function canUseNativeTextTracks(media: VideoMedia): boolean {
  return typeof (media as { addTextTrack?: unknown }).addTextTrack === "function";
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
export function useRemoteTextTracks(
  tracks: VideoJsTextTrackList | undefined
): {
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
    const previousTextTracks = Object.getOwnPropertyDescriptor(
      mediaRecord,
      "textTracks"
    );
    const previousAddTextTrack = Object.getOwnPropertyDescriptor(
      mediaRecord,
      "addTextTrack"
    );

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

    let cancelled = false;
    const sources = trackSources;

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
            textTrack.addCue(
              new VTTCue(cue.startTime, cue.endTime, cue.text)
            );
          }
          textTrack.mode = "hidden";
          next.push({ ...track, cues, textTrack });
        } catch {
          // 個別トラックの読み込み失敗は他トラックに影響させない
        }
      }

      if (!cancelled) {
        setLoadedTracks(next);
        host.textTracks.dispatchEvent(new Event("change"));
        media.dispatchEvent(new Event("texttrackchange"));
      }
    })();

    return () => {
      cancelled = true;
      setLoadedTracks([]);

      if (previousTextTracks) {
        Object.defineProperty(mediaRecord, "textTracks", previousTextTracks);
      } else {
        Reflect.deleteProperty(mediaRecord, "textTracks");
      }

      if (previousAddTextTrack) {
        Object.defineProperty(mediaRecord, "addTextTrack", previousAddTextTrack);
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
