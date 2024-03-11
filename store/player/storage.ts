import { atomWithStorage, createJSONStorage } from "jotai/utils";

/** 再生速度 */
export type PlaybackRate = number;

/** 音量 0-1 */
export type Volume = number;

/** ミュート */
export type Muted = boolean;

const keys = {
  playbackRate: "playbackRatePersister",
  volume: "volumePersisterVolume",
  muted: "volumePersisterMute",
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storage = createJSONStorage<any>(() => localStorage);

/** 再生速度 */
export const playbackRateAtom = atomWithStorage<PlaybackRate>(
  keys.playbackRate,
  1,
  storage
);

/** localStorage からの再生速度の読み込み処理 */
export function loadPlaybackRate(): number {
  const data = localStorage.getItem(keys.playbackRate);
  return Number(data ?? 1);
}

/** 音量 0-1 */
export const volumeAtom = atomWithStorage<Volume>(keys.volume, 1, storage);

/** ミュート */
export const muteAtom = atomWithStorage<Muted>(keys.muted, false, storage);
