import type { EventType } from "$server/models/event";
import { api } from "$utils/api";
import type { PlayerEvent, PlayerEvents, PlayerTracker } from "./playerTracker";
import { load as loadPlaybackRate } from "$utils/playbackRate";
import { load } from "./loggerSessionPersister";
import getFilePath from "./getFilePath";

/** v1のときのトラッキング用コードの移植 */
function send(eventType: EventType, event: PlayerEvent, detail?: string) {
  const session = load();
  if (!session) return;
  const idPrefix = session.oauthClient.id;
  const id = (id: string) => [idPrefix, id].join(":");
  const body = {
    event: eventType,
    detail,
    file: getFilePath(event),
    query: event.url.split("?")[1],
    current: event.currentTime.toString(),
    rid: id(session.ltiResourceLinkRequest.id),
    uid: id(session.ltiUser.id),
    cid: id(session.ltiContext.id),
    nonce: session.oauthClient.nonce,
  };
  return api.apiV2EventPost({ body });
}

const buildHandler =
  <T extends EventType & keyof PlayerEvents>(eventType: T) =>
  (event: PlayerEvents[T]) =>
    send(eventType, event);

const buildSender = (event: EventType, tracker: PlayerTracker) => () =>
  send(event, tracker.stats);

/** ロギング開始 */
function logger(tracker: PlayerTracker) {
  if (typeof window === "undefined") return;
  // TODO: Window オブジェクトを介さない排他制御にしたい
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
    void send("seeked", event, seekStart?.toString());
    seekStart = null;
  });

  /* Record subtitle information */
  tracker.on("texttrackchange", function (event) {
    void send("trackchange", event, event.language ?? "off");
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
    const persistentRate = loadPlaybackRate();
    if (persistentRate !== event.playbackRate) {
      void send("ratechange", event, event.playbackRate.toString());
    }
  });

  tracker.on("nextvideo", function (event) {
    void send("changepage", event, event.video.toString());
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
  handlers.visibilitychange = function () {
    if (document.visibilityState === "hidden") {
      void send("hidden-ended", tracker.stats);
    }
  };
  document.addEventListener("visibilitychange", handlers.visibilitychange);

  clearInterval(prevHandlers.timer?.());
  const timer = setInterval(() => send("current-time", tracker.stats), 10000);
  handlers.timer = () => timer;

  // @ts-expect-error TODO: Window オブジェクトを介さない排他制御にしたい
  window.__handlers = handlers;
  // @ts-expect-error TODO: Window オブジェクトを介さない排他制御にしたい
  window.__tracker = tracker;
}

export default logger;
