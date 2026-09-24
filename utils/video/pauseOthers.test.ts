import { describe, expect, it, vi } from "vitest";
import type { VideoInstance } from "$types/videoInstance";
import type { VideoMedia } from "$utils/video/media";
import { pauseOtherVideos } from "./pauseOthers";

function createInstance(media: VideoInstance["media"]): VideoInstance {
  return {
    type: "wowza",
    url: "https://example.com/video.m3u8",
    media,
    stopTimeOver: false,
    firstPlay: true,
  };
}

function mockMedia(pause: () => void): VideoMedia {
  return { pause } as unknown as VideoMedia;
}

describe("pauseOtherVideos", () => {
  it("pauses all instances except the current id", () => {
    const pauseCurrent = vi.fn();
    const pauseOther = vi.fn();
    const video = new Map<string, VideoInstance>([
      ["1", createInstance(mockMedia(pauseCurrent))],
      ["2", createInstance(mockMedia(pauseOther))],
    ]);

    pauseOtherVideos(video, "1");

    expect(pauseCurrent).not.toHaveBeenCalled();
    expect(pauseOther).toHaveBeenCalledTimes(1);
  });

  it("ignores instances without media", () => {
    const video = new Map<string, VideoInstance>([
      ["1", createInstance(null)],
      ["2", createInstance(null)],
    ]);

    expect(() => pauseOtherVideos(video, "1")).not.toThrow();
  });
});
