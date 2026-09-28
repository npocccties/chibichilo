import { describe, expect, it } from "vitest";
import {
  getActiveCueText,
  parseVttTimestamp,
  parseWebVtt,
} from "./parseWebVtt";

describe("parseVttTimestamp", () => {
  it("parses mm:ss.mmm and hh:mm:ss.mmm", () => {
    expect(parseVttTimestamp("00:01.000")).toBe(1);
    expect(parseVttTimestamp("01:02:03.500")).toBe(3723.5);
  });
});

describe("parseWebVtt", () => {
  it("parses cues and skips NOTE blocks", () => {
    const cues = parseWebVtt(`WEBVTT

NOTE comment

00:01.000 --> 00:02.000
こんにちは

00:02.000 --> 00:04.500
世界
二行目
`);

    expect(cues).toEqual([
      { startTime: 1, endTime: 2, text: "こんにちは" },
      { startTime: 2, endTime: 4.5, text: "世界\n二行目" },
    ]);
  });

  it("strips simple cue markup", () => {
    const cues = parseWebVtt(`WEBVTT

00:00.000 --> 00:01.000
<c>Hello</c>
`);
    expect(cues[0]?.text).toBe("Hello");
  });
});

describe("getActiveCueText", () => {
  it("returns active cue text at the given time", () => {
    const cues = [
      { startTime: 1, endTime: 2, text: "a" },
      { startTime: 2, endTime: 3, text: "b" },
    ];
    expect(getActiveCueText(cues, 0.5)).toBe("");
    expect(getActiveCueText(cues, 1.5)).toBe("a");
    expect(getActiveCueText(cues, 2)).toBe("b");
    expect(getActiveCueText(cues, 3)).toBe("");
  });
});
