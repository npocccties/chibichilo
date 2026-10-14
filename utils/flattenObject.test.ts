import { describe, expect, it } from "vitest";
import flattenObject from "./flattenObject";

describe("flattenObject", () => {
  it("flattens nested objects with dot notation keys", () => {
    expect(
      flattenObject({
        learner: { id: 1, name: "Alice" },
        book: { id: 2 },
      })
    ).toEqual({
      "learner.id": 1,
      "learner.name": "Alice",
      "book.id": 2,
    });
  });

  it("preserves dates and arrays", () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    expect(
      flattenObject({
        createdAt,
        tags: ["a", "b"],
      })
    ).toEqual({
      createdAt,
      tags: ["a", "b"],
    });
  });
});
