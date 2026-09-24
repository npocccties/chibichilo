import { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import useDebouncedCallback from "$utils/useDebouncedCallback";
import type { VideoMedia } from "$utils/video/media";
import { getMediaTextTracks } from "$utils/video/media";
import type { Muted, PlaybackRate, TextTrack, Volume } from "./storage";
import {
  muteAtom,
  playbackRateAtom,
  textTrackAtom,
  volumeAtom,
} from "./storage";

/** 動画プレイヤー準備完了かどうかの取得処理 */
function getReady(media: VideoMedia): boolean {
  // NOTE: 埋め込み系メディアはバッファリング完了まで誤った値が得られうるため待機
  return media.readyState === 4; // HaveEnoughData
}

/** イベント発火の間隔を間引くための遅延時間 (ms) */
const wait = 100;
/** readyState 監視間隔 (ms) */
const interval = 1_000;

/** 動画プレイヤー準備状況へのアクセス */
function useReady(media: VideoMedia | null): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!media) {
      setReady(false);
      return;
    }

    let id: ReturnType<typeof setInterval> | undefined;

    const update = () => {
      if (!getReady(media)) return false;
      setReady(true);
      if (id !== undefined) {
        clearInterval(id);
        id = undefined;
      }
      return true;
    };

    if (update()) return;

    setReady(false);
    id = setInterval(update, interval);

    return () => {
      if (id !== undefined) clearInterval(id);
    };
  }, [media]);

  return ready;
}

function setPlayerPlaybackRate(media: VideoMedia, data: PlaybackRate): void {
  media.playbackRate = data;
}

async function getPlayerPlaybackRate(media: VideoMedia): Promise<PlaybackRate> {
  return media.playbackRate ?? 1;
}

function setPlayerVolume(
  media: VideoMedia,
  data: { volume: Volume; muted: Muted }
): void {
  media.volume = data.volume;
  media.muted = data.muted;
}

async function getPlayerVolume(media: VideoMedia): Promise<{
  volume: Volume;
  muted: Muted;
}> {
  return {
    volume: media.volume ?? NaN,
    muted: media.muted ?? false,
  };
}

function setPlayerTextTrack(media: VideoMedia, data: TextTrack): void {
  const textTracks: TextTrack[] = [];
  const trackList = getMediaTextTracks(media);

  for (let i = 0; i < trackList.length; i++) {
    textTracks.push(Object.assign(trackList[i], { index: i }) as TextTrack);
  }

  let textTrack = textTracks.find(
    ({ index, kind, language }) =>
      index === data.index && kind === data.kind && language === data.language
  );

  textTrack ??= textTracks.find(
    ({ kind, language }) => kind === data.kind && language === data.language
  );

  if (!textTrack) {
    for (const t of textTracks) {
      t.mode = "disabled";
    }
    return;
  }

  textTrack.mode = data.mode;
}

async function getPlayerTextTrack(
  media: VideoMedia
): Promise<TextTrack | undefined> {
  const textTracks: TextTrack[] = [];
  const trackList = getMediaTextTracks(media);

  for (let i = 0; i < trackList.length; i++) {
    textTracks.push(Object.assign(trackList[i], { index: i }) as TextTrack);
  }

  if (textTracks.length === 0) return;

  let textTrack = textTracks.find(({ mode }) => mode === "showing");
  textTrack ??= textTracks[0];

  return {
    index: textTracks.findIndex((t) => t === textTrack),
    kind: textTrack.kind,
    language: textTrack.language,
    mode: textTrack.mode as "showing" | "disabled",
  };
}

/** プレイヤー設定の保存と反映のためのカスタムフック */
export function usePlayerState(media: VideoMedia | null) {
  const ready = useReady(media);
  const [playbackRate, setPlaybackRate] = useAtom(playbackRateAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [muted, setMuted] = useAtom(muteAtom);
  const [textTrack, setTextTrack] = useAtom(textTrackAtom);

  const onPlaybackRateChange = useCallback(async () => {
    if (!media) return;
    const data = await getPlayerPlaybackRate(media);
    setPlaybackRate(data);
  }, [media, setPlaybackRate]);

  useEffect(() => {
    if (!media || !ready) return;
    setPlayerPlaybackRate(media, playbackRate);
  }, [media, ready, playbackRate]);

  useEffect(() => {
    if (!media || !ready) return;
    media.addEventListener("ratechange", onPlaybackRateChange);
    return () => {
      media.removeEventListener("ratechange", onPlaybackRateChange);
    };
  }, [media, ready, onPlaybackRateChange]);

  const updateVolume = useCallback(async () => {
    if (!media) return;
    const data = await getPlayerVolume(media);
    setVolume(data.volume);
    setMuted(data.muted);
  }, [media, setVolume, setMuted]);

  const onVolumeChange = useDebouncedCallback(updateVolume, wait);

  useEffect(() => {
    if (!media || !ready) return;
    setPlayerVolume(media, { volume, muted });
  }, [media, ready, volume, muted]);

  useEffect(() => {
    if (!media || !ready) return;
    media.addEventListener("volumechange", onVolumeChange);
    return () => {
      media.removeEventListener("volumechange", onVolumeChange);
    };
  }, [media, ready, onVolumeChange]);

  const onTextTrackChange = useCallback(async () => {
    if (!media) return;
    const data = await getPlayerTextTrack(media);
    if (data) setTextTrack(data);
  }, [media, setTextTrack]);

  useEffect(() => {
    if (!media || !ready) return;
    setPlayerTextTrack(media, textTrack);
  }, [media, ready, textTrack]);

  useEffect(() => {
    if (!media || !ready) return;
    media.addEventListener("texttrackchange", onTextTrackChange);
    return () => {
      media.removeEventListener("texttrackchange", onTextTrackChange);
    };
  }, [media, ready, onTextTrackChange]);
}
