import * as base from "search-query-parser";
import yn from "yn";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { SearchQueryBase } from "$server/models/searchQuery";

const options = {
  keywords: [
    "name" as const,
    "description" as const,
    "author" as const,
    "partial-keyword" as const,
    "keyword" as const,
    "license" as const,
    "shared" as const,
    "link" as const,
    "book" as const,
    "latest-release" as const,
  ],
  alwaysArray: true,
  tokenize: true,
};

type SearchParserResult = base.SearchParserResult & {
  // NOTE: keywords and `{ alwaysArray: true }`
  [K in (typeof options)["keywords"][number]]?: string[];
} & {
  // NOTE: `{ tokenize: true }`
  text?: string[];
};

/**
 * 真偽値を表現する検索クエリー文字列のパース
 * @param input 対象の文字列
 */
function parseBoolean(input: string): boolean[] {
  const output: boolean | undefined = yn(input);
  if (output == null) return [];
  return [output];
}

/**
 * 検索クエリー文字列 `license:` キーワードのパース
 * @param input `license:` 以降の文字列
 * @return 一致するライセンス
 */
function parseLicense(input: string): string[] {
  switch (input) {
    case "none":
      return [""];
    default:
      return [input];
  }
}

/**
 * 検索クエリー文字列 `link:` キーワードのパース
 * @param input `link:` 以降の文字列
 * @return LtiResourceLink に関する情報
 */
function parseLink(
  input: string
): Array<Pick<LtiResourceLinkSchema, "consumerId" | "contextId">> {
  const token = ":";
  if (!input.includes(token)) return [];
  const [consumerId, contextId] = input.split(token).map(decodeURIComponent);
  return [{ consumerId, contextId }];
}

/**
 * 検索クエリー文字列 `book:` キーワードのパース
 * @param input `book:` 以降の文字列
 * @return ブックID
 */
function parseBook(input: string): number[] {
  const bookId = Number.parseInt(input);
  if (Number.isNaN(bookId)) return [];
  return [bookId];
}

export function parse(query: string): SearchQueryBase {
  const res = base.parse(query, options) as SearchParserResult;
  return {
    text: res.text ?? [],
    name: res.name ?? [],
    description: res.description ?? [],
    author: res.author ?? [],
    partialKeyword: res["partial-keyword"] ?? [],
    keyword: res.keyword ?? [],
    license: res.license?.flatMap(parseLicense) ?? [],
    shared: res.shared?.flatMap(parseBoolean) ?? [],
    link: res.link?.flatMap(parseLink) ?? [],
    book: res.book?.flatMap(parseBook) ?? [],
    latestRelease: res["latest-release"]?.flatMap(parseBoolean) ?? [],
  };
}

/**
 * ライセンスを検索クエリー文字列に変換
 * @param license ライセンス
 * @return 検索クエリー文字列
 */
function stringifyLicense(license: string): string {
  switch (license) {
    case "":
      return "none";
    default:
      return license;
  }
}

/**
 * LTI Contextを検索クエリー文字列に変換
 * @param link LTI Context
 * @return 検索クエリー文字列
 */
function stringifyLink(
  link: Pick<LtiResourceLinkSchema, "consumerId" | "contextId">
): string {
  const token = [link.consumerId, link.contextId]
    .map(encodeURIComponent)
    .join(":");
  return token;
}

export function stringify(query: Partial<SearchQueryBase>): string {
  const { license, shared, link, book, latestRelease, ...rest } = query;
  const token = {
    text: [],
    name: [],
    description: [],
    author: [],
    partialKeyword: [],
    keyword: [],
    license: license?.map(stringifyLicense).join() ?? [],
    shared: shared?.map(String).join() ?? [],
    link: link?.map(stringifyLink).join() ?? [],
    book: book?.map(String).join() ?? [],
    "latest-release": latestRelease?.map(String).join() ?? [],
  };
  return base.stringify({ ...token, ...rest }, options);
}
