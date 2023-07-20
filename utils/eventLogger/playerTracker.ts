import type { StrictEventEmitter } from "strict-event-emitter-types";
import { EventEmitter } from "events";
import type { VideoJsPlayer } from "$types/videoJsPlayer";
import VimeoPlayer from "@vimeo/player";
import type { VideoResourceSchema } from "$server/models/videoResource";
import youtubePlayedShims from "$utils/youtubePlayedShims";

const basicEventsMap = [
  "ended",
  "pause",
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
  durationchange: PlayerEvent & { duration: number };
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
  /** 現在再生時間 */
  currentTime = 0;
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

  get stats() {
    const { providerUrl, url, currentTime } = this;
    return { providerUrl, url, currentTime };
  }

  private intoVideoJs(player: VideoJsPlayer) {
    player.on("timeupdate", () => {
      this.currentTime = player.currentTime();
    });

    for (const event of basicEventsMap) {
      player.on(event, () => this.emit(event, this.stats));
    }

    // NOTE: video-js-user-triggered-playイベントを学習者起因でのイベントとみなす
    player.on("video-js-user-triggered-play", () => {
      this.emit("play", this.stats);
    });

    player.on("ratechange", () => {
      this.emit("playbackratechange", {
        ...this.stats,
        playbackRate: player.playbackRate(),
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

    /** 初回再生 */
    let firstPlay = true;
    player.on("play", () => {
      // NOTE: 初回以降のplayイベントを自動再生ではない学習者起因でのイベントとみなす
      if (firstPlay) firstPlay = false;
      else this.emit("play", this.stats);
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
