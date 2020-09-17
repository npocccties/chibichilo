import { StrictEventEmitter } from "strict-event-emitter-types";
import { EventEmitter } from "events";
import { VideoJsPlayer } from "video.js";
import { Player as VimeoPlayer } from "@vimeo/player";

const basicEventsMap = [
  "ended",
  "pause",
  "play",
  "seeked",
  "seeking",
  "timeupdate",
] as const;

/** プレイヤーのトラッキング用 */
export class PlayerTracker extends (EventEmitter as {
  new (): StrictEventEmitter<EventEmitter, PlayerEvents>;
}) {
  constructor(player: VideoJsPlayer | VimeoPlayer) {
    super();

    if (player instanceof VimeoPlayer) {
      this.intoVimeo(player);
    } else {
      this.intoVideoJs(player);
    }
  }

  intoVideoJs(player: VideoJsPlayer) {
    for (const event of basicEventsMap) {
      player.on(event, () => this.emit(event, videoJsStats(player)));
    }

    player.on("firstplay", () => this.emit("firstplay", videoJsStats(player)));
    player.on("ratechange", () => {
      this.emit("playbackratechange", {
        ...videoJsStats(player),
        playbackRate: player.playbackRate(),
      });
    });
    player.on("texttrackchange", () => {
      const showingSubtitle = [...player.remoteTextTracks()].find(
        ({ kind, mode }) => kind === "subtitles" && mode === "showing"
      );
      this.emit("texttrackchange", {
        ...videoJsStats(player),
        language: showingSubtitle?.language ?? "und",
      });
    });
  }

  intoVimeo(player: VimeoPlayer) {
    for (const event of basicEventsMap) {
      player.on(event, async () => this.emit(event, await vimeoStats(player)));
    }

    player.on("playbackratechange", async (data: { playbackRate: number }) => {
      this.emit("playbackratechange", {
        ...(await vimeoStats(player)),
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
          ...(await vimeoStats(player)),
          language: data.language,
        });
      }
    );
  }
}

function videoJsStats(player: VideoJsPlayer): PlayerEvent {
  return {
    type: /youtube/.test(player.currentType()) ? "youtube" : "wowza",
    src: player.src(),
    currentTime: player.currentTime(),
  };
}

async function vimeoStats(player: VimeoPlayer): Promise<PlayerEvent> {
  const [src, currentTime] = await Promise.all([
    player.getVideoId(),
    player.getCurrentTime(),
  ]);
  return {
    type: "vimeo",
    src: src.toString(),
    currentTime,
  };
}
