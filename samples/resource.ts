import { outdent } from "outdent";

const resource = {
  id: 1,
  /** @deprecated */
  videoId: 1,
  url: "https://www.youtube.com/watch?v=KxNMj61Rgnc",
  providerUrl: "https://www.youtube.com/",
  tracks: [
    {
      id: 1,
      kind: "subtitles",
      language: "ja",
      url: URL.createObjectURL(
        new Blob([
          outdent`
            WEBVTT

            00:01.000 --> 00:02.000
            分数関数

            00:02.000 --> 00:12.000
            分数関数の基本は"f(x)=1/x (x≠0)"という形で定義される関数です
            `,
        ])
      ),
      accessToken: "",
    },
    {
      id: 2,
      kind: "subtitles",
      language: "en",
      url: URL.createObjectURL(new Blob([])),
      accessToken: "",
    },
  ],
  details: {},
};

export default resource;
