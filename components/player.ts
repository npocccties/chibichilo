import { SetStateAction, useEffect } from "react";
import { StrictEventEmitter } from "strict-event-emitter-types";
import { EventEmitter } from "events";
import { VideoJsPlayer } from "video.js";
import VimeoPlayer from "@vimeo/player";
import { useAppPlayerTracker, useAppState } from "./state";

const basicEventsMap = [
  "ended",
  "pause",
  "play",
  "seeked",
  "seeking",
  "timeupdate",
] as const;

type CustomEvents = {
  nextvideo: PlayerEvent & { video: VideoSchema["id"] };
};

const nullEvent = {
  type: "youtube",
  src: "",
  currentTime: 0,
} as const;

/** プレイヤーのトラッキング用 */
export class PlayerTracker extends (EventEmitter as {
  new (): StrictEventEmitter<EventEmitter, PlayerEvents & CustomEvents>;
}) {
  readonly player: VideoJsPlayer | VimeoPlayer;
  readonly stats: () => Promise<PlayerEvent>;

  constructor(player: VideoJsPlayer | VimeoPlayer) {
    super();
    this.player = player;

    if (player instanceof VimeoPlayer) {
      this.stats = async () => vimeoStats(player);
      this.intoVimeo(player);
    } else {
      this.stats = async () => videoJsStats(player);
      this.intoVideoJs(player);
    }
  }

  async next(video: VideoSchema["id"]) {
    this.emit("nextvideo", { ...(await this.stats()), video });
  }

  private intoVideoJs(player: VideoJsPlayer) {
    for (const event of basicEventsMap) {
      player.on(event, async () => this.emit(event, await this.stats()));
    }

    player.on("firstplay", async () =>
      this.emit("firstplay", await this.stats())
    );
    player.on("ratechange", async () => {
      this.emit("playbackratechange", {
        ...(await this.stats()),
        playbackRate: player.playbackRate(),
      });
    });
    player.on("texttrackchange", async () => {
      const showingSubtitle = Array.from(player.remoteTextTracks()).find(
        ({ kind, mode }) => kind === "subtitles" && mode === "showing"
      );
      this.emit("texttrackchange", {
        ...(await this.stats()),
        language: showingSubtitle?.language,
      });
    });
  }

  private intoVimeo(player: VimeoPlayer) {
    for (const event of basicEventsMap) {
      player.on(event, async () => this.emit(event, await vimeoStats(player)));
    }

    player.on("playbackratechange", async (data: { playbackRate: number }) => {
      this.emit("playbackratechange", {
        ...(await this.stats()),
        playbackRate: data.playbackRate,
      });
    });
    player.on(
      "texttrackchange",
      async (data: {
        kind: "captions" | "subtitles";
        label: string;
        language: string;
      }) => {
        if (data.kind !== "subtitles") return;
        this.emit("texttrackchange", {
          ...(await this.stats()),
          language: data.language,
        });
      }
    );
  }
}

function videoJsStats(player: VideoJsPlayer): PlayerEvent {
  // @ts-expect-error
  if (player.isDisposed()) return nullEvent;

  return {
    type: /youtube/.test(player.currentType()) ? "youtube" : "wowza",
    src: player.src(),
    currentTime: player.currentTime(),
  };
}

async function vimeoStats(player: VimeoPlayer): Promise<PlayerEvent> {
  try {
    const [src, currentTime] = await Promise.all([
      player.getVideoId(),
      player.getCurrentTime(),
    ]);
    return {
      type: "vimeo",
      src: src.toString(),
      currentTime,
    };
  } catch {
    return nullEvent;
  }
}

function playerTrackerState(
  player?: VideoJsPlayer | VimeoPlayer
): SetStateAction<PlayerTracker | undefined> {
  if (!player) return () => undefined;
  return (prev) => {
    if (prev?.player === player) return prev;
    if (prev != null) prev.removeAllListeners();
    return new PlayerTracker(player);
  };
}

export function usePlayerTracking() {
  const playerTracker = useAppPlayerTracker();
  const tracking = (player?: VideoJsPlayer | VimeoPlayer) =>
    playerTracker(playerTrackerState(player));

  useEffect(() => () => tracking());

  return tracking;
}

export const usePlayerTracker = () => useAppState().playerTracker;
