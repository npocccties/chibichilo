import { describe, expect, it } from "vitest";
import { formatMsToHms, formatSecondsToHms } from "./formatHms";

describe("formatHms", () => {
  it("formats seconds to hh:mm:ss.sss", () => {
    expect(formatSecondsToHms(3661.5)).toBe("01:01:01.500");
  });

  it("formats milliseconds to hh:mm:ss.sss", () => {
    expect(formatMsToHms(90061000)).toBe("25:01:01.000");
  });
});
