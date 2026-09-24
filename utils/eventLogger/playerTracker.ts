import type { StrictEventEmitter } from "strict-event-emitter-types";
import { EventEmitter } from "events";
import type { VideoProviderType } from "$types/videoInstance";
import type { VideoMedia } from "$utils/video/media";
import { getMediaTextTracks } from "$utils/video/media";

const basicEventsMap = [
  "ended",
  "pause",
  "play",
  "seeked",
  "seeking",
  "timeupdate",
] as const;

export type PlayerStats = Pick<
  PlayerTracker,
  "providerUrl" | "url" | "currentTime" | "firstPlay" | "topicId"
>;

type CustomEvents = {
  nextvideo: PlayerStats & { video: number };
  forward: PlayerStats;
  back: PlayerStats;
  durationchange: PlayerStats & { duration: number };
};

export type PlayerEvents = {
  ended: PlayerStats;
  pause: PlayerStats;
  play: PlayerStats;
  seeked: PlayerStats;
  seeking: PlayerStats;
  timeupdate: PlayerStats;
  playbackratechange: PlayerStats & { playbackRate: number };
  texttrackchange: PlayerStats & { language?: string };
} & CustomEvents;

const SEEK_BUTTON_SECONDS = 10;

const providerUrlByType: Record<VideoProviderType, string> = {
  youtube: "https://www.youtube.com/",
  vimeo: "https://vimeo.com/",
  wowza: "",
};

/** プレイヤーのトラッキング用 */
export class PlayerTracker extends (EventEmitter as {
  new (): StrictEventEmitter<EventEmitter, PlayerEvents>;
}) {
  /** 動画プレイヤーオブジェクト */
  readonly player: VideoMedia;
  /** 動画プロバイダーの識別子 */
  readonly providerUrl: string;
  /** ビデオURL */
  readonly url: string;
  /** トピックID */
  topicId = 0;
  /** 現在再生時間 */
  currentTime = 0;
  /** 初回再生 */
  firstPlay = true;
  /** 再生した時間範囲の取得 */
  readonly getPlayed: () => Promise<[number, number][]>;

  constructor(
    player: VideoMedia,
    url = "",
    type?: VideoProviderType
  ) {
    super();
    this.player = player;
    this.url = url;
    this.providerUrl = resolveProviderUrl(type, url);
    this.getPlayed = async () => {
      const timeRanges = player.played ?? createEmptyTimeRanges();
      return [...Array(timeRanges.length)].map((_, i) => [
        timeRanges.start(i),
        timeRanges.end(i),
      ]);
    };
    this.intoMedia(player);
  }

  next(video: number) {
    this.emit("nextvideo", { ...this.stats, video });
  }

  get stats(): PlayerStats {
    const { providerUrl, url, currentTime, firstPlay, topicId } = this;
    return { providerUrl, url, currentTime, firstPlay, topicId };
  }

  private intoMedia(player: VideoMedia) {
    let seekFromTime = 0;

    player.addEventListener("timeupdate", () => {
      this.currentTime = player.currentTime ?? NaN;
    });

    for (const event of basicEventsMap) {
      player.addEventListener(event, () => this.emit(event, this.stats));
    }

    player.addEventListener("play", () => {
      this.firstPlay = false;
    });

    player.addEventListener("ratechange", () => {
      this.emit("playbackratechange", {
        ...this.stats,
        playbackRate: player.playbackRate ?? NaN,
      });
    });

    getMediaTextTracks(player).addEventListener("change", () => {
      const showingSubtitle = Array.from(getMediaTextTracks(player)).find(
        ({ kind, mode }) => kind === "subtitles" && mode === "showing"
      );
      this.emit("texttrackchange", {
        ...this.stats,
        language: showingSubtitle?.language,
      });
    });

    player.addEventListener("seeking", () => {
      seekFromTime = player.currentTime ?? 0;
    });

    player.addEventListener("seeked", () => {
      const delta = (player.currentTime ?? 0) - seekFromTime;
      if (Math.abs(delta - SEEK_BUTTON_SECONDS) < 1) {
        this.emit("forward", this.stats);
      } else if (Math.abs(delta + SEEK_BUTTON_SECONDS) < 1) {
        this.emit("back", this.stats);
      }
    });

    player.addEventListener("durationchange", () => {
      const duration = player.duration;
      if (Number.isFinite(duration) && duration > 0) {
        this.emit("durationchange", { ...this.stats, duration });
      }
    });
  }
}

function resolveProviderUrl(
  type: VideoProviderType | undefined,
  srcUrl: string
): string {
  if (type && providerUrlByType[type]) return providerUrlByType[type];
  try {
    return srcUrl ? `${new URL(srcUrl).origin}/` : "";
  } catch {
    return "";
  }
}

function createEmptyTimeRanges(): TimeRanges {
  return {
    length: 0,
    start: () => 0,
    end: () => 0,
  };
}
