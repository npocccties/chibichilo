import { VideoJsPlayer } from "video.js";
import { postForm } from "./api";
import { loadSessionInStorage } from "./session";

const sendLogPath = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/log.php`;

/** video-learner.js にあったトラッキング用コードの移植 */
function sendLog(eventType: EventType, player: VideoJsPlayer, detail?: string) {
  const currentSrc = player?.currentSrc(); // NOTE: `watch?v={YouTube Video ID}` (Player.tsx)
  const youtubeQuery = currentSrc?.split("?")[1];
  const youtubeVideoId =
    new URLSearchParams(youtubeQuery).get("v") ?? undefined;
  const currentTime = player?.currentTime();
  const session = loadSessionInStorage();
  const req: Request = {
    event: eventType,
    detail,
    file: youtubeVideoId,
    query: youtubeQuery,
    current: currentTime?.toString(),
    rid: session?.lmsResource,
    uid: session?.id,
    cid: session?.lmsCourse,
    nonce: session?.nonce,
  };
  return fetch(sendLogPath, postForm(req));
}
type EventType =
  | "changepage"
  | "timeupdate"
  | "seeking"
  | "seeked"
  | "change"
  | "trackchange"
  | "firstplay"
  | "play"
  | "pause"
  | "ratechange"
  | "ended"
  | "beforeunload-ended"
  | "pagehide-ended"
  | "unload-ended"
  | "hidden-ended"
  | "current-time";
type Request = {
  event: EventType;
  detail?: string;
  file?: string; // NOTE: YouTube Video ID
  query?: string; // NOTE: `v={YouTube Video ID}`
  current?: string;
  rid?: string;
  uid?: string;
  cid?: string;
  nonce?: string;
};

export function sendVideoId(player: VideoJsPlayer, id: VideoSchema["id"]) {
  return sendLog("changepage", player, id.toString());
}

/** video-learner.js にあったトラッキング用コードの移植 */
export function trackingStart(player: VideoJsPlayer) {
  if (typeof window === "undefined") return;

  /* Record the start and end of seek time */
  let previousTime = 0;
  let currentTime = 0;
  let seekStart: number | null;
  player.on("timeupdate", function () {
    previousTime = currentTime;
    currentTime = player.currentTime();
  });
  player.on("seeking", function () {
    if (seekStart === null) {
      seekStart = previousTime;
    }
  });
  player.on("seeked", function () {
    sendLog("seeked", player, seekStart?.toString());
    seekStart = null;
  });

  /* Record subtitle information */
  let timeout: number;
  player.remoteTextTracks().addEventListener("change", function action() {
    window.clearTimeout(timeout);
    let showing = Array.from(player.remoteTextTracks()).filter(function (
      track
    ) {
      if (track.kind === "subtitles" && track.mode === "showing") {
        return true;
      } else {
        return false;
      }
    })[0];
    timeout = window.setTimeout(function () {
      player.trigger("subtitleChanged", showing);
    }, 10);
  });
  player.on("subtitleChanged", function (_, track) {
    if (track) {
      sendLog("trackchange", player, track.language);
    } else {
      sendLog("trackchange", player, "off");
    }
  });

  player.on("firstplay", function () {
    sendLog("firstplay", player);
  });
  player.on("play", function () {
    sendLog("play", player);
  });
  player.on("pause", function () {
    sendLog("pause", player);
  });
  player.on("ratechange", function () {
    sendLog("ratechange", player, player.playbackRate().toString());
  });
  player.on("ended", function () {
    sendLog("ended", player);
  });

  // TODO: Window オブジェクトを介さない排他制御にしたい
  // @ts-expect-error
  if ("__trackingStart" in window && player === window.__trackingStart) return;
  window.addEventListener("beforeunload", function () {
    sendLog("beforeunload-ended", player);
  });
  window.addEventListener("pagehide", function () {
    sendLog("pagehide-ended", player);
  });
  window.addEventListener("unload", function () {
    sendLog("unload-ended", player);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState == "hidden") {
      sendLog("hidden-ended", player);
    }
  });
  setInterval(function () {
    sendLog("current-time", player);
  }, 10000);
  // TODO: Window オブジェクトを介さない排他制御にしたい
  // @ts-expect-error
  window.__trackingStart = player;
}
