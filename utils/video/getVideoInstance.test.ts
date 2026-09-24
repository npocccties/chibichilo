import { describe, expect, it } from "vitest";
import type { VideoResourceSchema } from "$server/models/videoResource";
import { createVideoInstance } from "./getVideoInstance";
import getVideoInstance from "./getVideoInstance";

const resourceBase: Pick<
  VideoResourceSchema,
  "providerUrl" | "url" | "accessToken" | "tracks"
> = {
  providerUrl: "https://example.wowza.com/",
  url: "https://example.wowza.com/video/playlist.m3u8",
  accessToken: "token",
  tracks: [],
};

describe("getVideoInstance", () => {
  it("routes youtube to video instance", () => {
    const instance = getVideoInstance({
      ...resourceBase,
      providerUrl: "https://www.youtube.com/",
      url: "https://www.youtube.com/watch?v=test",
    });

    expect(instance).toMatchObject({
      type: "youtube",
      media: null,
    });
  });

  it("routes vimeo to video instance", () => {
    const instance = getVideoInstance({
      ...resourceBase,
      providerUrl: "https://vimeo.com/",
      url: "https://vimeo.com/123",
    });

    expect(instance).toMatchObject({
      type: "vimeo",
      media: null,
    });
  });

  it("routes wowza to video instance", () => {
    const instance = getVideoInstance(resourceBase);

    expect(instance).toMatchObject({
      type: "wowza",
      media: null,
    });
  });
});

describe("createVideoInstance", () => {
  it("creates a wowza video instance", () => {
    const instance = createVideoInstance(
      "wowza",
      resourceBase.url + "?accessToken=token",
      {
        poster: "https://example.com/poster.jpg",
      }
    );

    expect(instance).toMatchObject({ type: "wowza" });
    expect(instance.poster).toBe("https://example.com/poster.jpg");
    expect(instance.media).toBeNull();
    expect(instance.url).toContain("accessToken=token");
  });
});
