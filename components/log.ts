import { postFormFetchText } from "./api";
import { PlayerTracker } from "./player";
import { loadSessionInStorage } from "./session";

const basePath = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "";
const sendLogPath = `${basePath}/call/log.php`;

type EventType =
  | "changepage"
  | "timeupdate"
  | "seeking"
  | "seeked"
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

/** video-learner.js にあったトラッキング用コードの移植 */
function send(eventType: EventType, event: PlayerEvent, detail?: string) {
  const session = loadSessionInStorage();
  const req: Request = {
    event: eventType,
    detail,
    // TODO: Vimeo 未対応
    file:
      event.type === "wowza"
        ? event.src
            .split("?")[0]
            .split("/_definst_/")[1]
            .split("/playlist.m3u8")[0]
        : new URLSearchParams(event.src.split("?")[1]).get("v") ?? undefined,
    query: event.src.split("?")[1], // TODO: Vimeo 未対応
    current: event.currentTime.toString(),
    rid: session?.lmsResource,
    uid: session?.id,
    cid: session?.lmsCourse,
    nonce: session?.nonce,
  };
  return postFormFetchText(sendLogPath, req);
}
type Request = {
  event: EventType;
  detail?: string;
  file?: string;
  query?: string;
  current?: string;
  rid?: string;
  uid?: string;
  cid?: string;
  nonce?: string;
};

const buildHandler = <T extends EventType & keyof PlayerEvents>(
  eventType: T
) => (event: PlayerEvents[T]) => send(eventType, event);

const buildSender = (event: EventType, tracker: PlayerTracker) => async () =>
  send(event, await tracker.stats());

/** トラッキング開始 */
export function startTracking(tracker: PlayerTracker) {
  if (typeof window === "undefined") return;

  /* Record the start and end of seek time */
  let previousTime = 0;
  let currentTime = 0;
  let seekStart: number | null;
  tracker.on("timeupdate", function (event) {
    previousTime = currentTime;
    currentTime = event.currentTime;
  });
  tracker.on("seeking", function () {
    if (seekStart === null) {
      seekStart = previousTime;
    }
  });
  tracker.on("seeked", function (event) {
    send("seeked", event, seekStart?.toString());
    seekStart = null;
  });

  /* Record subtitle information */
  tracker.on("texttrackchange", function (event) {
    send("trackchange", event, event.language ?? "off");
  });

  for (const event of ["firstplay", "ended", "pause", "play"] as const) {
    tracker.on(event, buildHandler(event));
  }

  tracker.on("playbackratechange", function (event) {
    send("ratechange", event, event.playbackRate.toString());
  });

  tracker.on("nextvideo", function (event) {
    send("changepage", event, event.video.toString());
  });

  // TODO: Window オブジェクトを介さない排他制御にしたい
  // @ts-expect-error
  if ("__trackingStart" in window && tracker === window.__trackingStart) return;
  for (const event of ["beforeunload", "pagehide", "unload"] as const) {
    // FIXME: removeEventListener 呼ばれない
    window.addEventListener(
      event,
      // TODO: TypeScript 4.1 以降では as EventType を外せる、はず
      buildSender(`${event}-ended` as EventType, tracker)
    );
  }

  // FIXME: removeEventListener 呼ばれない
  document.addEventListener("visibilitychange", async function () {
    if (document.visibilityState === "hidden")
      send("hidden-ended", await tracker.stats());
  });

  // FIXME: clearInterval 呼ばれない
  setInterval(async () => send("current-time", await tracker.stats()), 10000);

  // TODO: Window オブジェクトを介さない排他制御にしたい
  // @ts-expect-error
  window.__trackingStart = tracker;
}
