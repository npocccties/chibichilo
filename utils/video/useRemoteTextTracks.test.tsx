import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { VideoJsTextTrackList } from "$types/videoJsPlayer";
import { useRemoteTextTracks } from "./useRemoteTextTracks";

const { useMedia } = vi.hoisted(() => ({ useMedia: vi.fn() }));
vi.mock("@videojs/react", () => ({ useMedia }));

beforeEach(() => vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true));
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("restores subtitle state even if YouTube was destroyed before cleanup", async () => {
  const engine = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(() => {
      throw new TypeError("Cannot read properties of null (reading 'src')");
    }),
    setOption: vi.fn(),
  };
  const textTracks = Object.assign(new EventTarget(), { length: 0 });
  const media = Object.assign(new EventTarget(), {
    currentTime: 0,
    play: vi.fn(),
    engine,
    textTracks,
  });
  useMedia.mockReturnValue(media);
  // jsdom は TextTrackList の EventTarget API を実装していない。
  vi.spyOn(HTMLMediaElement.prototype, "textTracks", "get").mockReturnValue(
    Object.assign(new EventTarget(), { length: 0 }) as TextTrackList
  );
  let resolveFetch!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    )
  );
  const tracks = [
    { src: "/captions.vtt", srclang: "ja", label: "日本語" },
  ] as VideoJsTextTrackList;
  function Subtitles() {
    useRemoteTextTracks(tracks);
    return null;
  }
  const root = createRoot(document.createElement("div"));
  const previousHosts = document.body.querySelectorAll("video").length;
  act(() => root.render(<Subtitles />));
  expect(document.body.querySelectorAll("video")).toHaveLength(
    previousHosts + 1
  );
  expect(media.textTracks).not.toBe(textTracks);
  expect(() => act(() => root.unmount())).not.toThrow();
  expect(engine.removeEventListener).toHaveBeenCalled();
  expect(media.textTracks).toBe(textTracks);
  expect("addTextTrack" in media).toBe(false);
  expect(document.body.querySelectorAll("video")).toHaveLength(previousHosts);
  engine.setOption.mockClear();
  media.dispatchEvent(new Event("play"));
  expect(engine.setOption).not.toHaveBeenCalled();
  // アンマウント後に完了した読み込みがトラックを再作成しない。
  await act(async () => {
    resolveFetch(new Response("WEBVTT\n\n00:00.000 --> 00:01.000\n字幕"));
  });
  expect(media.textTracks).toBe(textTracks);
  expect(document.body.querySelectorAll("video")).toHaveLength(previousHosts);
});
