import { describe, expect, it } from "vitest";
import { resolveRelativePathname } from "./toPath";

describe("resolveRelativePathname", () => {
  it.each([
    ["/topics/new", "./edit", "/topics/edit"],
    ["/topics/new", "./", "/topics"],
    ["/topics/edit", "./", "/topics"],
    ["/book/edit/topic/new", "./edit", "/book/edit/topic/edit"],
    ["/book/edit/topic/new", "./", "/book/edit/topic"],
    ["/book/edit/topic/edit", "./", "/book/edit/topic"],
    ["/books/topic/edit", "./", "/books/topic"],
    ["/book/topic/edit", "./", "/book/topic"],
    ["/book/import/topic/edit", "./", "/book/import/topic"],
    ["/book/topic/import/edit", "./", "/book/topic/import"],
  ])("from %s + %s → %s", (from, to, expected) => {
    expect(resolveRelativePathname(to, from)).toBe(expected);
  });
});
