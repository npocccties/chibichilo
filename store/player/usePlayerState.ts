import { useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import useSWRImmutable from "swr/immutable";
import { useDebouncedCallback } from "use-debounce";
import type { VideoJsPlayer } from "$types/videoJsPlayer";
import VimeoPlayer from "@vimeo/player";
import type { Muted, PlaybackRate, TextTrack, Volume } from "./storage";
import {
  muteAtom,
  playbackRateAtom,
  textTrackAtom,
  volumeAtom,
} from "./storage";

type Player = VideoJsPlayer | VimeoPlayer;

/** イベント発火の間隔を間引くための遅延時間 (ms) */
const wait = 100;
/** VideoJsPlayer.readyState() 監視間隔 (ms) */
const interval = 1_000;

/** 動画プレイヤー準備完了かどうかの取得処理 */
function getReady(player: Player): boolean {
  return (
    player instanceof VimeoPlayer ||
    // NOTE: videojs-youtube はバッファリングが行われるまで誤った値が得られうるため待機
    player.readyState() === 4 // HaveEnoughData
  );
}

/** 動画プレイヤー準備状況へのアクセス */
function useReady(player: Player): boolean {
  const { data: ready } = useSWRImmutable(player, getReady, {
    refreshInterval: interval,
  });

  return Boolean(ready);
}

/** 動画プレイヤーへの再生速度の設定処理 */
function setPlayerPlaybackRate(player: Player, data: PlaybackRate): void {
  if (player instanceof VimeoPlayer) {
    void player.setPlaybackRate(data);
  } else {
    player.playbackRate(data);
  }
}

/** 動画プレイヤーからの再生速度の取得処理 */
async function getPlayerPlaybackRate(player: Player): Promise<PlaybackRate> {
  const data = await (player instanceof VimeoPlayer
    ? player.getPlaybackRate()
    : player.playbackRate() ?? 1);
  return data;
}

/** 動画プレイヤーへの音量の設定処理 */
function setPlayerVolume(
  player: Player,
  data: { volume: Volume; muted: Muted }
): void {
  if (player instanceof VimeoPlayer) {
    void player.setVolume(data.volume);
    void player.setMuted(data.muted);
  } else {
    player.volume(data.volume);
    player.muted(data.muted);
  }
}

/** 動画プレイヤーからの音量の取得処理 */
async function getPlayerVolume(player: Player): Promise<{
  volume: Volume;
  muted: Muted;
}> {
  const [volume, muted] = await Promise.all([
    player instanceof VimeoPlayer ? player.getVolume() : player.volume() ?? NaN,
    player instanceof VimeoPlayer ? player.getMuted() : player.muted() ?? false,
  ]);
  return { volume, muted };
}

/** 動画プレイヤーへの字幕の設定処理 */
function setPlayerTextTrack(player: Player, data: TextTrack): void {
  if (player instanceof VimeoPlayer) {
    return; // Vimeo は字幕非対応
  }

  const textTracks: TextTrack[] = [];

  // VideoJsTextTrackListは配列ではない
  const vjsTtl = player.remoteTextTracks();

  for (let i = 0; i < vjsTtl.length; i++) {
    textTracks.push(Object.assign(vjsTtl[i], { index: i }) as TextTrack);
  }

  // 最初に選択順・種別・言語の完全一致を探索
  let textTrack = textTracks.find(
    ({ index, kind, language }) =>
      index === data.index && kind === data.kind && language === data.language
  );

  // 見つからない場合、種別・言語の一致を探索
  textTrack ??= textTracks.find(
    ({ kind, language }) => kind === data.kind && language === data.language
  );

  if (!textTrack) {
    // それでも見つからない場合はすべて非表示にする
    for (const t of textTracks) {
      t.mode = "disabled";
    }
    return;
  }

  // 見つかった字幕の表示・非表示を反映する
  textTrack.mode = data.mode;
}

/** 動画プレイヤーからの字幕の取得処理 */
async function getPlayerTextTrack(
  player: Player
): Promise<TextTrack | undefined> {
  // Vimeo は字幕非対応
  if (player instanceof VimeoPlayer) return;

  const textTracks: TextTrack[] = [];

  // VideoJsTextTrackListは配列ではない
  const vjsTtl = player.remoteTextTracks();

  for (let i = 0; i < vjsTtl.length; i++) {
    textTracks.push(Object.assign(vjsTtl[i], { index: i }) as TextTrack);
  }

  // 動画に字幕が設定されていない場合は何もしない
  if (textTracks.length === 0) return;

  // 表示されている字幕を探索
  let textTrack = textTracks.find(({ mode }) => mode === "showing");

  // 見つからない場合、先頭を使用
  textTrack ??= textTracks[0];

  return {
    index: textTracks.findIndex((t) => t === textTrack),
    kind: textTrack.kind,
    language: textTrack.language,
    mode: textTrack.mode as "showing" | "disabled",
  };
}

/** プレイヤー設定の保存と反映のためのカスタムフック */
export function usePlayerState(player: Player) {
  const ready = useReady(player);
  const [playbackRate, setPlaybackRate] = useAtom(playbackRateAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [muted, setMuted] = useAtom(muteAtom);
  const [textTrack, setTextTrack] = useAtom(textTrackAtom);

  const onPlaybackRateChange = useCallback(async () => {
    const data = await getPlayerPlaybackRate(player);
    setPlaybackRate(data);
  }, [player, setPlaybackRate]);

  useEffect(() => {
    if (ready) setPlayerPlaybackRate(player, playbackRate);
  }, [player, ready, playbackRate]);

  useEffect(() => {
    if (ready) player.on("ratechange", onPlaybackRateChange);
    return () => player.off("ratechange", onPlaybackRateChange);
  }, [player, ready, onPlaybackRateChange]);

  const updateVolume = useCallback(async () => {
    const data = await getPlayerVolume(player);
    setVolume(data.volume);
    setMuted(data.muted);
  }, [player, setVolume, setMuted]);

  const onVolumeChange = useDebouncedCallback(updateVolume, wait);

  useEffect(() => {
    if (ready) setPlayerVolume(player, { volume, muted });
  }, [player, ready, volume, muted]);

  useEffect(() => {
    if (ready) player.on("volumechange", onVolumeChange);
    return () => player.off("volumechange", onVolumeChange);
  }, [player, ready, onVolumeChange]);

  const onTextTrackChange = useCallback(async () => {
    const data = await getPlayerTextTrack(player);
    if (data) setTextTrack(data);
  }, [player, setTextTrack]);

  useEffect(() => {
    if (ready) setPlayerTextTrack(player, textTrack);
  }, [player, ready, textTrack]);

  useEffect(() => {
    if (ready) player.on("texttrackchange", onTextTrackChange);
    return () => player.off("texttrackchange", onTextTrackChange);
  }, [player, ready, onTextTrackChange]);
}
