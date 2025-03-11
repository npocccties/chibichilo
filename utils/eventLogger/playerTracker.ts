import type { StrictEventEmitter } from "strict-event-emitter-types";
import { EventEmitter } from "events";
import type { VideoJsPlayer } from "$types/videoJsPlayer";
import VimeoPlayer from "@vimeo/player";
import youtubePlayedShims from "$utils/youtubePlayedShims";

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

const youtubeType = "video/youtube";

/** プレイヤーのトラッキング用 */
export class PlayerTracker extends (EventEmitter as {
  new (): StrictEventEmitter<EventEmitter, PlayerEvents>;
}) {
  /** 動画プレイヤーオブジェクト */
  readonly player: VideoJsPlayer | VimeoPlayer;
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

  constructor(player: VideoJsPlayer | VimeoPlayer, url = "") {
    super();
    this.player = player;

    if (player instanceof VimeoPlayer) {
      // NOTE: getVideoUrl() はプライバシー設定によって URL の取得を行えないことがあるので使わない
      //  see also https://github.com/vimeo/player.js/#getvideourl-promisestring-privacyerrorerror
      this.url = url;
      this.providerUrl = "https://vimeo.com/";
      this.getPlayed = player.getPlayed.bind(player);
      this.intoVimeo(player);
    } else {
      // NOTE: YouTube Player API に存在しない API の再現
      youtubePlayedShims(player);

      this.url = url || player.src();
      this.providerUrl =
        player.currentType() === youtubeType
          ? "https://www.youtube.com/"
          : `${new URL(player.src()).origin}/`;

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

  next(video: number) {
    this.emit("nextvideo", { ...this.stats, video });
  }

  get stats(): PlayerStats {
    const { providerUrl, url, currentTime, firstPlay, topicId } = this;
    return { providerUrl, url, currentTime, firstPlay, topicId };
  }

  private intoVideoJs(player: VideoJsPlayer) {
    player.on("timeupdate", () => {
      this.currentTime = player.currentTime() ?? NaN;
    });

    for (const event of basicEventsMap) {
      player.on(event, () => this.emit(event, this.stats));
    }

    player.on("play", () => {
      this.firstPlay = false;
    });

    player.on("ratechange", () => {
      this.emit("playbackratechange", {
        ...this.stats,
        playbackRate: player.playbackRate() ?? NaN,
      });
    });

    // NOTE: texttrackchange イベントは表示の都度発火されるため使用しない
    player.remoteTextTracks().addEventListener("change", () => {
      const showingSubtitle = Array.from(player.remoteTextTracks()).find(
        ({ kind, mode }) => kind === "subtitles" && mode === "showing"
      );
      this.emit("texttrackchange", {
        ...this.stats,
        language: showingSubtitle?.language,
      });
    });

    // @ts-expect-error NOTE: videojs-seek-buttons 由来
    const { seekForward, seekBack } = player.controlBar;
    seekForward.on("click", () => this.emit("forward", this.stats));
    seekBack.on("click", () => this.emit("back", this.stats));
  }

  private intoVimeo(player: VimeoPlayer) {
    player.on("timeupdate", ({ seconds }: { seconds: number }) => {
      this.currentTime = seconds;
    });

    for (const event of basicEventsMap) {
      player.on(event, () => this.emit(event, this.stats));
    }

    player.on("play", () => {
      this.firstPlay = false;
    });

    player.on("playbackratechange", (data: { playbackRate: number }) => {
      this.emit("playbackratechange", {
        ...this.stats,
        playbackRate: data.playbackRate,
      });
    });
    player.on(
      "texttrackchange",
      (data: {
        kind: "captions" | "subtitles";
        label: string;
        language: string;
      }) => {
        if (data.kind !== "subtitles") return;
        this.emit("texttrackchange", {
          ...this.stats,
          language: data.language,
        });
      }
    );
    void player
      .getDuration()
      .then((duration) =>
        this.emit("durationchange", { ...this.stats, duration })
      );
  }
}
