import { describe, expect, it } from "vitest";
import getLanguageNativeName from "./getLanguageNativeName";

describe("getLanguageNativeName", () => {
  it("returns native language name", () => {
    expect(getLanguageNativeName("ja")).toBe("日本語");
    expect(getLanguageNativeName("en")).toBe("English");
  });

  it("returns input when language code is invalid", () => {
    expect(getLanguageNativeName("invalid-code")).toBe("invalid-code");
  });
});
