import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlayerTracker } from "$utils/eventLogger/playerTracker";
import { createVideoInstance } from "./getVideoInstance";
import type { VideoMedia } from "./media";
import { useVideoPlayback } from "./useVideoPlayback";

vi.mock("$store/player", () => ({ usePlayerState: () => undefined }));
vi.mock("$store/playerTracker", () => ({
  usePlayerTrackingAtom: () => () => undefined,
}));

const container = document.createElement("div");
let root = createRoot(container);
beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => {
  act(() => root.unmount());
  root = createRoot(container);
  vi.unstubAllGlobals();
});

function setup(stopTime?: number) {
  const media = Object.assign(new EventTarget(), {
    readyState: 1,
    currentTime: 0,
    duration: 30,
    paused: false,
    pause: vi.fn(),
    play: vi.fn(),
  }) as unknown as VideoMedia;
  const videoInstance = createVideoInstance("vimeo", "https://vimeo.com/123");
  const order: string[] = [];
  let tracker: PlayerTracker;
  const onEnded = vi.fn(() => {
    order.push("next");
    // トピック切替時の tracker の解除を再現する。
    tracker.removeAllListeners();
  });
  function Playback() {
    useVideoPlayback({ media, videoInstance, active: true, stopTime, onEnded });
    return null;
  }
  act(() => root.render(<Playback />));
  tracker = new PlayerTracker(media, videoInstance.url, "vimeo");
  const logEnded = vi.fn(() => order.push("ended"));
  tracker.on("ended", logEnded);
  return { media, onEnded, logEnded, order };
}

describe("playback completion", () => {
  it("logs natural completion before switching topics", async () => {
    const { media, onEnded, logEnded, order } = setup();
    await act(async () => {
      media.currentTime = 30;
      media.dispatchEvent(new Event("ended"));
    });
    expect(logEnded).toHaveBeenCalledTimes(1);
    expect(logEnded).toHaveBeenCalledWith(
      expect.objectContaining({ currentTime: 30 })
    );
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["ended", "next"]);
  });

  it("switches topics at the clip end without emitting ended, as on master", async () => {
    const { media, onEnded, logEnded, order } = setup(10);
    const mediaEnded = vi.fn();
    media.addEventListener("ended", mediaEnded);
    await act(async () => {
      media.currentTime = 10.1;
      media.dispatchEvent(new Event("timeupdate"));
      media.dispatchEvent(new Event("timeupdate"));
    });
    expect(media.pause).toHaveBeenCalledTimes(1);
    expect(mediaEnded).not.toHaveBeenCalled();
    expect(logEnded).not.toHaveBeenCalled();
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(order).toEqual(["next"]);
  });

  it("cancels pending navigation when the player is unmounted", async () => {
    const { media, onEnded } = setup();
    await act(async () => {
      media.dispatchEvent(new Event("ended"));
      root.unmount();
    });
    expect(onEnded).not.toHaveBeenCalled();
    root = createRoot(container);
  });
});
