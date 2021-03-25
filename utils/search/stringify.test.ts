import stringify from "./stringify";

test("LTI Contextを検索クエリー文字列に変換", () => {
  const queryStr = stringify({ consumerId: "test", contextId: "foo" });
  expect(queryStr).toBe("link:test:foo");
});

test(`":" や空白が含まれるLTI Contextを検索クエリー文字列に変換`, () => {
  const queryStr = stringify({ consumerId: "te:st", contextId: "fo o" });
  expect(queryStr).toBe("link:te%3Ast:fo%20o");
});
