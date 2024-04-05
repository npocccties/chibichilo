import getVideoType from "./getVideoType";

test("youtube", () => {
  expect(getVideoType("https://www.youtube.com/")).toBe("youtube");
});

test("vimeo", () => {
  expect(getVideoType("https://vimeo.com/")).toBe("vimeo");
});

test("wowza", () => {
  expect(getVideoType("https://www.wowza.com/")).toBe("wowza");
});

test("ビデオ以外もデフォルトでwowzaとみなす", () => {
  expect(getVideoType(null)).toBe("wowza");
});
