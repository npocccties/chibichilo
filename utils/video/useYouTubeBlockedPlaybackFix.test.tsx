import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VideoMedia } from "./media";
import { useYouTubeBlockedPlaybackFix } from "./useYouTubeBlockedPlaybackFix";

type Listener = (event: { data: number }) => void;

class FakeYouTubePlayer {
  listeners = new Set<Listener>();
  addEventListener(_: string, listener: Listener) {
    this.listeners.add(listener);
  }
  removeEventListener(_: string, listener: Listener) {
    this.listeners.delete(listener);
  }
  emit(data: number) {
    this.listeners.forEach((listener) => listener({ data }));
  }
}

/** `@videojs/youtube-video` の BUFFERING 後に UNSTARTED へ戻っても paused が戻らない挙動を再現する */
class FakeAdapter extends EventTarget {
  engine = new FakeYouTubePlayer();
  #paused = true;
  #playFired = false;
  constructor() {
    super();
    this.#bind();
  }
  /** iframe の作り直し。古いプレイヤーは破棄される */
  recreate() {
    this.engine = new FakeYouTubePlayer();
    this.#paused = true;
    this.#playFired = false;
    this.#bind();
    this.dispatchEvent(new Event("loadstart"));
  }
  #bind() {
    this.engine.addEventListener("onStateChange", ({ data }) => {
      if ((data === 1 || data === 3) && !this.#playFired) {
        this.#playFired = true;
        this.#paused = false;
        this.dispatchEvent(new Event("play"));
      }
      if (data === 1) this.dispatchEvent(new Event("playing"));
    });
  }
  get paused() {
    return this.#paused;
  }
}

const container = document.createElement("div");
let root = createRoot(container);
beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => {
  act(() => root.unmount());
  root = createRoot(container);
  vi.unstubAllGlobals();
});

function setup() {
  const adapter = new FakeAdapter();
  const media = adapter as unknown as VideoMedia;
  const events: string[] = [];
  for (const type of ["play", "pause"]) {
    media.addEventListener(type, () => events.push(type));
  }
  function Fix() {
    useYouTubeBlockedPlaybackFix(media, true);
    return null;
  }
  act(() => root.render(<Fix />));
  return { adapter, media, events };
}

describe("useYouTubeBlockedPlaybackFix", () => {
  it("restores paused when playback is refused and returns to unstarted", () => {
    const { adapter, media, events } = setup();
    adapter.engine.emit(3);
    expect(media.paused).toBe(false);
    adapter.engine.emit(-1);
    expect(media.paused).toBe(true);
    expect(events).toEqual(["play", "pause"]);
  });

  it("emits play again when playback starts after a refusal", () => {
    const { adapter, media, events } = setup();
    adapter.engine.emit(3);
    adapter.engine.emit(5);
    adapter.engine.emit(3);
    adapter.engine.emit(1);
    expect(media.paused).toBe(false);
    expect(events).toEqual(["play", "pause", "play"]);
  });

  it("ignores unstarted before playback is attempted", () => {
    const { adapter, media, events } = setup();
    adapter.engine.emit(-1);
    adapter.engine.emit(5);
    expect(media.paused).toBe(true);
    expect(events).toEqual([]);
  });

  it("unmounts cleanly even if YouTube was destroyed before cleanup", () => {
    const { adapter, media } = setup();
    adapter.engine.emit(3);
    adapter.engine.emit(-1);
    vi.spyOn(adapter.engine, "removeEventListener").mockImplementation(() => {
      throw new TypeError("Cannot read properties of null (reading 'src')");
    });
    expect(() => act(() => root.unmount())).not.toThrow();
    root = createRoot(container);
    expect(Object.hasOwn(media, "paused")).toBe(false);
  });

  it("follows a recreated player even if the old one was destroyed", () => {
    const { adapter, media, events } = setup();
    const destroyed = adapter.engine;
    vi.spyOn(destroyed, "removeEventListener").mockImplementation(() => {
      throw new TypeError("Cannot read properties of null (reading 'src')");
    });
    expect(() => adapter.recreate()).not.toThrow();
    adapter.engine.emit(3);
    adapter.engine.emit(-1);
    expect(media.paused).toBe(true);
    expect(events).toEqual(["play", "pause"]);
  });

  it("restores the adapter's paused on unmount", () => {
    const { adapter, media } = setup();
    adapter.engine.emit(3);
    adapter.engine.emit(-1);
    act(() => root.unmount());
    root = createRoot(container);
    expect(Object.hasOwn(media, "paused")).toBe(false);
    expect(media.paused).toBe(false);
  });
});
