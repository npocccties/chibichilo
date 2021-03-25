import { Query } from "./query";

const linkQuery = /link:(?<consumerId>[^:]+):(?<contextId>[^\s]+)/gu;

/**
 * 検索クエリーへのパース
 * @param input 検索クエリー文字列
 * @return 検索クエリー
 */
function parse(input: string): Query {
  const normalizedQuery = input
    .replace(linkQuery, "")
    .normalize("NFKD")
    .toLowerCase()
    .trim();
  const keywords = normalizedQuery === "" ? [] : normalizedQuery.split(/\s+/u);
  const ltiResourceLinks = [...input.matchAll(linkQuery)].map(({ groups }) => {
    const [consumerId, contextId] = [
      groups?.consumerId ?? "",
      groups?.contextId ?? "",
    ].map(decodeURIComponent);
    return { consumerId, contextId };
  });
  return { keywords, ltiResourceLinks };
}

export default parse;
