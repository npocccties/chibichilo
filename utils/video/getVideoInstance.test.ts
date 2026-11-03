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
  it("routes youtube to video instance with tracks", () => {
    const instance = getVideoInstance({
      ...resourceBase,
      providerUrl: "https://www.youtube.com/",
      url: "https://www.youtube.com/watch?v=test",
      tracks: [
        {
          id: 1,
          kind: "subtitles",
          language: "ja",
          url: "/api/v2/resource/1/video_track/1/vtt",
          accessToken: "vtt-token",
        },
      ],
    });

    expect(instance).toMatchObject({
      type: "youtube",
      media: null,
    });
    expect(instance.tracks).toHaveLength(1);
    expect(instance.tracks?.[0]).toMatchObject({
      kind: "subtitles",
      srclang: "ja",
    });
  });

  it("routes vimeo to video instance with tracks", () => {
    const instance = getVideoInstance({
      ...resourceBase,
      providerUrl: "https://vimeo.com/",
      url: "https://vimeo.com/123",
      tracks: [
        {
          id: 2,
          kind: "subtitles",
          language: "en",
          url: "/api/v2/resource/1/video_track/2/vtt",
          accessToken: "vtt-token",
        },
      ],
    });

    expect(instance).toMatchObject({
      type: "vimeo",
      media: null,
    });
    expect(instance.tracks).toHaveLength(1);
    expect(instance.tracks?.[0]).toMatchObject({
      kind: "subtitles",
      srclang: "en",
    });
  });

  it("routes wowza to video instance with tracks", () => {
    const instance = getVideoInstance({
      ...resourceBase,
      tracks: [
        {
          id: 3,
          kind: "subtitles",
          language: "ja",
          url: "/api/v2/resource/1/video_track/3/vtt",
          accessToken: "vtt-token",
        },
      ],
    });

    expect(instance).toMatchObject({
      type: "wowza",
      media: null,
    });
    expect(instance.tracks).toHaveLength(1);
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
