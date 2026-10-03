import { describe, expect, it, vi } from "vitest";
import type { VideoMedia } from "./media";
import { safePause } from "./media";

function mockMedia(pause: () => void): VideoMedia {
  return { pause } as unknown as VideoMedia;
}

describe("safePause", () => {
  it("calls pause when media is available", () => {
    const pause = vi.fn();
    safePause(mockMedia(pause));
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it("ignores nullish media", () => {
    expect(() => safePause(null)).not.toThrow();
    expect(() => safePause(undefined)).not.toThrow();
  });

  it("swallows pause errors from unready providers", () => {
    const pause = vi.fn(() => {
      throw new TypeError("_a2.pauseVideo is not a function");
    });

    expect(() => safePause(mockMedia(pause))).not.toThrow();
    expect(pause).toHaveBeenCalledTimes(1);
  });
});
