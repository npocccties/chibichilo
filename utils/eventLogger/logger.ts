import type { EventType } from "$server/models/event";
import { api } from "$utils/api";
import { PlayerEvent, PlayerEvents, PlayerTracker } from "./playerTracker";
import { load } from "./loggerSessionPersister";

/** v1のときのトラッキング用コードの移植 */
function send(eventType: EventType, event: PlayerEvent, detail?: string) {
  const ltiLaunchBody = load();
  if (!ltiLaunchBody) return;
  const { oauth_consumer_key: idPrefix } = ltiLaunchBody;
  const id = (id: string) => [idPrefix, id].join(":");
  const body = {
    event: eventType,
    detail,
    // TODO: Vimeo 未対応
    file:
      event.providerUrl === "https://www.youtube.com/"
        ? new URLSearchParams(event.url.split("?")[1]).get("v") ?? undefined
        : event.url
            .split("?")[0]
            ?.split("/_definst_/")[1]
            ?.split("/playlist.m3u8")[0],
    query: event.url.split("?")[1], // TODO: Vimeo 未対応
    current: event.currentTime.toString(),
    rid: id(ltiLaunchBody.resource_link_id),
    uid: id(ltiLaunchBody.user_id),
    cid: id(ltiLaunchBody.context_id),
    nonce: ltiLaunchBody.oauth_nonce,
  };
  return api.apiV2EventPost({ body });
}

const buildHandler = <T extends EventType & keyof PlayerEvents>(
  eventType: T
) => (event: PlayerEvents[T]) => send(eventType, event);

const buildSender = (event: EventType, tracker: PlayerTracker) => async () =>
  send(event, await tracker.stats());

/** ロギング開始 */
function logger(tracker: PlayerTracker) {
  if (typeof window === "undefined") return;
  // @ts-expect-error TODO: Window オブジェクトを介さない排他制御にしたい
  if ("__tracker" in window && tracker === window.__tracker) return;

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

  for (const event of [
    "forward",
    "back",
    "firstplay",
    "ended",
    "pause",
    "play",
  ] as const) {
    tracker.on(event, buildHandler(event));
  }

  tracker.on("playbackratechange", function (event) {
    send("ratechange", event, event.playbackRate.toString());
  });

  tracker.on("nextvideo", function (event) {
    send("changepage", event, event.video.toString());
  });

  // @ts-expect-error TODO: Window オブジェクトを介さない排他制御にしたい
  const prevHandlers = window.__handlers ?? {};
  const handlers: Record<string, () => void> = {};

  for (const event of ["beforeunload", "pagehide", "unload"] as const) {
    window.removeEventListener(event, prevHandlers[event]);
    handlers[event] = buildSender(`${event}-ended` as const, tracker);
    window.addEventListener(event, handlers[event]);
  }

  document.removeEventListener(
    "visibilitychange",
    prevHandlers.visibilitychange
  );
  handlers.visibilitychange = async function () {
    if (document.visibilityState === "hidden")
      send("hidden-ended", await tracker.stats());
  };
  document.addEventListener("visibilitychange", handlers.visibilitychange);

  clearInterval(prevHandlers.timer?.());
  const timer = setInterval(
    async () => send("current-time", await tracker.stats()),
    10000
  );
  handlers.timer = () => timer;

  // @ts-expect-error TODO: Window オブジェクトを介さない排他制御にしたい
  window.__handlers = handlers;
  // @ts-expect-error TODO: Window オブジェクトを介さない排他制御にしたい
  window.__tracker = tracker;
}

export default logger;
