import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";

export type SearchQueryBase = {
  /** 検索文字列 (名称 OR 説明 OR 著者名) */
  text: string[];
  /** 名称 (トピックの場合: トピック名、ブックの場合: ブック名・セクション名・トピック名) */
  name: string[];
  /** 説明 (Markdown) */
  description: string[];
  /** 著者名 */
  author: string[];
  /** キーワード (部分一致) */
  partialKeyword: string[];
  /** キーワード */
  keyword: string[];
  /** ライセンス (文字列: SPDX License Identifier, 空文字列: 未設定) */
  license: string[];
  /** 共有可否 (true: シェアする, それ以外: シェアしない) */
  shared: boolean[];
  /** トピックの場合: 無効、ブックの場合: 配信されているコース */
  link: Array<Pick<LtiResourceLinkSchema, "consumerId" | "contextId">>;
  /** トピックの場合: 関連するブックのID、ブックの場合: ブックID */
  book: number[];
  /** トピックの場合: 無効、ブックの場合: 最新版リリース (true: 最新版のリリースのみ, それ以外: すべて) */
  latestRelease: boolean[];
};

export type TopicSearchQuery = SearchQueryBase & {
  /** コンテンツ種別 (トピックの場合: "topic"、ブックの場合: "book") */
  type: "topic";
};

export type BookSearchQuery = SearchQueryBase & {
  /** コンテンツ種別 (トピックの場合: "topic"、ブックの場合: "book") */
  type: "book";
};

export type SearchQuery = TopicSearchQuery | BookSearchQuery;
