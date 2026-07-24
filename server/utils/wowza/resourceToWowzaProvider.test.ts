process.env.WOWZA_THUMBNAIL_BASE_URL = "https://wz.cccties.org/tmb/";
process.env.WOWZA_THUMBNAIL_EXTENSION = "jpg";

import resourceToWowzaProvider from "./resourceToWowzaProvider";

describe("resourceToWowzaProvider()：Wowzaのサムネイル画像変換", function () {
  test("成功", function () {
    const resource = {
      id: 6,
      videoId: 6,
      url: "https://demo.chibichilo.net/api/v2/wowza/EZfWmlVrnweRfYn/10/20220920-1518-F2N6AO/vuca_1.mp4",
      details: {},
    };

    const actual = resourceToWowzaProvider(resource);

    expect(actual).toStrictEqual({
      version: "1.0",
      type: "link",
      thumbnail_url:
        "https://wz.cccties.org/tmb/EZfWmlVrnweRfYn/10/20220920-1518-F2N6AO/vuca_1.jpg",
    });
  });
});
