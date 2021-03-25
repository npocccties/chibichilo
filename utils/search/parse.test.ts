import parse from "./parse";

test(`検索クエリー "foo bar" のパースに成功`, () => {
  expect(parse("foo bar").keywords).toEqual(["foo", "bar"]);
});

test(`検索クエリー " Foo  bar " のパースに成功`, () => {
  expect(parse(" Foo  bar ").keywords).toEqual(["foo", "bar"]);
});

test("NFKD正規化", () => {
  expect(parse("3⁹").keywords).toEqual(["39"]);
});

test("LTI Resource Linkのフィルターが含まれる", () => {
  expect(parse("link:test:foo link:test:bar")).toEqual({
    keywords: [],
    ltiResourceLinks: [
      {
        consumerId: "test",
        contextId: "foo",
      },
      {
        consumerId: "test",
        contextId: "bar",
      },
    ],
  });
});

test(`LTI Resource Linkのフィルターに ":" や空白が含まれる`, () => {
  expect(parse("link:te%3Ast:fo%20o").ltiResourceLinks).toEqual([
    {
      consumerId: "te:st",
      contextId: "fo o",
    },
  ]);
});
