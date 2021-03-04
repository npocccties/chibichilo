import type { StrictEventEmitter } from "strict-event-emitter-types";
import { EventEmitter } from "events";
import { VideoJsPlayer } from "video.js";
import VimeoPlayer from "@vimeo/player";
import type { VideoResourceSchema } from "$server/models/videoResource";
import youtubePlayedShims from "$utils/youtubePlayedShims";

const basicEventsMap = [
  "ended",
  "pause",
  "play",
  "seeked",
  "seeking",
  "timeupdate",
] as const;

export type PlayerEvent = Pick<VideoResourceSchema, "providerUrl" | "url"> & {
  /** ビデオの経過時間 (秒) */
  currentTime: number;
};

type CustomEvents = {
  nextvideo: PlayerEvent & { video: number };
  forward: PlayerEvent;
  back: PlayerEvent;
};

export type PlayerEvents = {
  ended: PlayerEvent;
  pause: PlayerEvent;
  play: PlayerEvent;
  seeked: PlayerEvent;
  seeking: PlayerEvent;
  timeupdate: PlayerEvent;
  playbackratechange: PlayerEvent & { playbackRate: number };
  texttrackchange: PlayerEvent & { language?: string };
  /** @deprecated */
  firstplay: PlayerEvent;
} & CustomEvents;

const nullEvent = {
  providerUrl: "https://www.youtube.com/",
  url: "",
  currentTime: 0,
} as const;

/** プレイヤーのトラッキング用 */
export class PlayerTracker extends (EventEmitter as {
  new (): StrictEventEmitter<EventEmitter, PlayerEvents>;
}) {
  readonly player: VideoJsPlayer | VimeoPlayer;
  readonly stats: () => Promise<PlayerEvent>;
  /** 再生した時間範囲の取得 */
  readonly getPlayed: () => Promise<[number, number][]>;

  constructor(player: VideoJsPlayer | VimeoPlayer) {
    super();
    this.player = player;

    if (player instanceof VimeoPlayer) {
      this.stats = async () => vimeoStats(player);
      this.getPlayed = player.getPlayed.bind(player);
      this.intoVimeo(player);
    } else {
      // NOTE: YouTube Player API に存在しない API の再現
      youtubePlayedShims(player);

      this.stats = async () => videoJsStats(player);
      this.getPlayed = async () => {
        const timeRanges = player.played() as TimeRanges;
        return [...Array(timeRanges.length)].map((_, i) => [
          timeRanges.start(i),
          timeRanges.end(i),
        ]);
      };

      this.intoVideoJs(player);
    }
  }

  async next(video: number) {
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

    // NOTE: texttrackchange イベントは表示の都度発火されるため使用しない
    player.remoteTextTracks().addEventListener("change", async () => {
      const showingSubtitle = Array.from(player.remoteTextTracks()).find(
        ({ kind, mode }) => kind === "subtitles" && mode === "showing"
      );
      this.emit("texttrackchange", {
        ...(await this.stats()),
        language: showingSubtitle?.language,
      });
    });

    // @ts-expect-error NOTE: videojs-seek-buttons 由来
    const { seekForward, seekBack } = player.controlBar;
    seekForward.on("click", async () => {
      this.emit("forward", await this.stats());
    });
    seekBack.on("click", async () => {
      this.emit("back", await this.stats());
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
  // @ts-expect-error: @types/video.js@^7.3.11 Unsupported
  if (player.isDisposed()) return nullEvent;

  return {
    // TODO: Wowza の識別子を決めて修正してください
    // providerUrl: /youtube/.test(player.currentType()) ? "https://www.youtube.com/" : "wowza",
    providerUrl: "https://www.youtube.com/",
    url: player.src(),
    currentTime: player.currentTime(),
  };
}

async function vimeoStats(player: VimeoPlayer): Promise<PlayerEvent> {
  try {
    const [url, currentTime] = await Promise.all([
      player.getVideoUrl(),
      player.getCurrentTime(),
    ]);
    return {
      providerUrl: "https://vimeo.com/",
      url,
      currentTime,
    };
  } catch {
    return nullEvent;
  }
}
