import { describe, expect, it, vi } from "vitest";
import { YouTubeAdapter } from "@videojs/youtube-video";
import { VimeoAdapter } from "@videojs/vimeo-video";
import type { VideoJsTextTrackList } from "$types/videoJsPlayer";
import type { VideoMedia } from "$utils/video/media";
import * as mediaUtils from "$utils/video/media";
import { PlayerTracker } from "./playerTracker";

const emptyTextTracks = [] as unknown as VideoJsTextTrackList;
emptyTextTracks.addEventListener = () => undefined;
emptyTextTracks.removeEventListener = () => undefined;
vi.spyOn(mediaUtils, "getMediaTextTracks").mockReturnValue(emptyTextTracks);

/**
 * YouTube / Vimeo はネイティブ HTMLMediaElement.played を持たないが、
 * @videojs/* adapters の MediaPlayedRangesMixin が同等の played を提供する。
 * PlayerTracker.getPlayed() がその経路で視聴区間を返せることを固定する。
 */
describe("PlayerTracker.getPlayed with @videojs adapters", () => {
  it("YouTubeAdapter exposes played and accumulates ranges during playback", async () => {
    const player = new YouTubeAdapter() as unknown as VideoMedia;
    expect(player.played).toBeDefined();

    const tracker = new PlayerTracker(
      player,
      "https://youtu.be/dQw4w9WgXcQ",
      "youtube"
    );

    expect(await tracker.getPlayed()).toEqual([[0, 0]]);

    player.dispatchEvent(new Event("play"));
    player.currentTime = 2;
    player.dispatchEvent(new Event("timeupdate"));
    player.currentTime = 8;
    player.dispatchEvent(new Event("timeupdate"));

    const ranges = await tracker.getPlayed();
    expect(ranges.some(([, end]) => end > 0)).toBe(true);
    expect(ranges[ranges.length - 1]?.[1]).toBeGreaterThanOrEqual(8);
  });

  it("VimeoAdapter exposes played (not getPlayed) and accumulates ranges", async () => {
    const adapter = new VimeoAdapter();
    expect(adapter.played).toBeDefined();
    expect(
      (adapter as unknown as { getPlayed?: unknown }).getPlayed
    ).toBeUndefined();

    const player = adapter as unknown as VideoMedia;
    const tracker = new PlayerTracker(
      player,
      "https://vimeo.com/123456789",
      "vimeo"
    );

    expect(await tracker.getPlayed()).toEqual([[0, 0]]);

    player.dispatchEvent(new Event("play"));
    player.currentTime = 3;
    player.dispatchEvent(new Event("timeupdate"));
    player.currentTime = 12;
    player.dispatchEvent(new Event("timeupdate"));

    const ranges = await tracker.getPlayed();
    expect(ranges.some(([, end]) => end > 0)).toBe(true);
    expect(ranges[ranges.length - 1]?.[1]).toBeGreaterThanOrEqual(12);
  });

  it("falls back to empty ranges when played is missing", async () => {
    const player = {
      play: () => undefined,
      pause: () => undefined,
      paused: true,
      currentTime: 0,
      duration: 0,
      playbackRate: 1,
      volume: 1,
      muted: false,
      seeking: false,
      readyState: 0,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => true,
    } as VideoMedia;

    const tracker = new PlayerTracker(
      player,
      "https://example.com/video.m3u8",
      "wowza"
    );
    expect(await tracker.getPlayed()).toEqual([]);
  });
});
