import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import type { ChibichiloPlayer, VideoProviderType } from "$types/videoInstance";
import { PlayerTracker } from "$utils/eventLogger/playerTracker";

const playerTrackerAtom = atom<PlayerTracker | undefined>(undefined);
const playerTrackingAtom = atom<
  PlayerTracker | undefined,
  [
    {
      url?: string;
      player: ChibichiloPlayer | undefined;
      type?: VideoProviderType;
    },
  ],
  void
>(
  (get) => get(playerTrackerAtom),
  (get, set, { player, url, type }) => {
    const prev = get(playerTrackerAtom);
    if (prev?.player === player) return;
    prev?.removeAllListeners();
    set(
      playerTrackerAtom,
      player && new PlayerTracker(player, url, type)
    );
  }
);

export function usePlayerTrackerAtom() {
  return useAtomValue(playerTrackerAtom);
}

export function usePlayerTrackingAtom() {
  useAtom(playerTrackerAtom);
  return useSetAtom(playerTrackingAtom);
}
