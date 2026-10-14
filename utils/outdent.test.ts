import { describe, expect, it } from "vitest";
import outdent from "./outdent";

describe("outdent", () => {
  it("removes common leading whitespace", () => {
    expect(outdent`
      ブックの詳細を取得します。
      教員または管理者いずれでもない場合、LTIリソースとしてリンクされているブックでなければなりません。`).toBe(
      "ブックの詳細を取得します。\n教員または管理者いずれでもない場合、LTIリソースとしてリンクされているブックでなければなりません。"
    );
  });

  it("preserves single-line strings", () => {
    expect(outdent`hello`).toBe("hello");
  });
});
