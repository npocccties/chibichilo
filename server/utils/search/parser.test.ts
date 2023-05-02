import { parse, stringify } from "./parser";

const emptyQuery = {
  text: [],
  name: [],
  description: [],
  author: [],
  partialKeyword: [],
  keyword: [],
  license: [],
  shared: [],
  link: [],
  book: [],
  latestRelease: [],
};

describe("parse()", function () {
  test("検索クエリー文字列をパースできる", function () {
    expect(
      parse(
        `name:a description:"b b" author:c partial-keyword:d keyword:e license:CC-BY-4.0 shared:true link:hoge:piyo book:42 foo bar baz latest-release:true`
      )
    ).toEqual({
      text: ["foo", "bar", "baz"],
      name: ["a"],
      description: ["b b"],
      author: ["c"],
      partialKeyword: ["d"],
      keyword: ["e"],
      license: ["CC-BY-4.0"],
      shared: [true],
      link: [{ consumerId: "hoge", contextId: "piyo" }],
      book: [42],
      latestRelease: [true],
    });
  });

  test("`license:none` は空文字列が得られる", function () {
    expect(parse(`license:none`).license).toEqual([""]);
  });

  test("`license:` の無効値の場合は何も得られない", function () {
    expect(parse("license:")).toEqual(emptyQuery);
  });

  test("`link:` 以降にいくつかキーワードが含まれる文字列をパースできる", function () {
    expect(parse("link:hoge:piyo,foo:bar").link).toEqual([
      { consumerId: "hoge", contextId: "piyo" },
      { consumerId: "foo", contextId: "bar" },
    ]);
  });

  test("`link:` がいくつか含まれる文字列をパースできる", function () {
    expect(parse("link:foo:bar link:hoge:piyo,te%3As%2Ct:fo%20o").link).toEqual(
      [
        { consumerId: "foo", contextId: "bar" },
        { consumerId: "hoge", contextId: "piyo" },
        { consumerId: "te:s,t", contextId: "fo o" },
      ]
    );
  });

  test("`link:` キーワードに区切り文字 `:` が含まない無効値の場合は何も得られない", function () {
    expect(parse("link:foo")).toEqual(emptyQuery);
  });
});

describe("stringify()", function () {
  test("検索クエリー文字列に変換", () => {
    const query = {
      text: ["a", "b"],
      keyword: ["foo", "bar"],
    };
    expect(stringify(query)).toBe("a b keyword:foo,bar");
  });

  test("空の検索クエリーは空文字列に変換", () => {
    const query = emptyQuery;
    expect(stringify(query)).toBe("");
  });

  test("ライセンス:未設定の検索クエリー文字列に変換", () => {
    const query = {
      license: [""],
    };
    expect(stringify(query)).toBe("license:none");
  });

  test("LTI Contextを検索クエリー文字列に変換", () => {
    const query = {
      link: [{ consumerId: "foo", contextId: "bar" }],
    };
    expect(stringify(query)).toBe("link:foo:bar");
  });

  test("いくつかのLTI Contextを検索クエリー文字列に変換", () => {
    const query = {
      link: [
        { consumerId: "foo", contextId: "bar" },
        { consumerId: "hoge", contextId: "piyo" },
      ],
    };
    expect(stringify(query)).toBe("link:foo:bar,hoge:piyo");
  });

  test("`:` や `,` や空白が含まれるLTI Contextを検索クエリー文字列に変換", () => {
    const query = {
      link: [{ consumerId: "te:s,t", contextId: "fo o" }],
    };
    expect(stringify(query)).toBe("link:te%3As%2Ct:fo%20o");
  });

  test("共有可否を検索クエリー文字列に変換", () => {
    const query = {
      shared: [true],
    };
    expect(stringify(query)).toBe("shared:true");
  });

  test("ブックIDを検索クエリー文字列に変換", () => {
    const query = {
      book: [42],
    };
    expect(stringify(query)).toBe("book:42");
  });

  test("最新リリースの有無を検索クエリー文字列に変換", () => {
    const query = {
      latestRelease: [false],
    };
    expect(stringify(query)).toBe("latest-release:false");
  });
});
