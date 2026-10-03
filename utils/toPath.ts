import type { UrlObject } from "url";

import type { ParsedUrlQueryInput } from "querystring";

type QueryValue = string | number | boolean | string[] | number[] | undefined;

export type AppRouterUrl =
  | string
  | UrlObject
  | {
      pathname: string;
      query?: Record<string, QueryValue>;
      hash?: string;
    };

function appendQuery(
  params: URLSearchParams,
  key: string,
  value: QueryValue
): void {
  if (value === undefined) return;
  if (Array.isArray(value)) {
    for (const item of value) {
      params.append(key, String(item));
    }
    return;
  }
  params.set(key, String(value));
}

export function normalizeQuery(
  query?: Record<string, QueryValue> | ParsedUrlQueryInput | null
): Record<string, QueryValue> | undefined {
  if (!query) return undefined;
  const result: Record<string, QueryValue> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      result[key] = value.map(String);
      continue;
    }
    result[key] = value as QueryValue;
  }
  return Object.keys(result).length ? result : undefined;
}

export function buildSearch(
  query?: Record<string, QueryValue>
): string | undefined {
  if (!query) return undefined;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    appendQuery(params, key, value);
  }
  const search = params.toString();
  return search ? `?${search}` : undefined;
}

export function withQuery(
  pathname: string,
  query?: Record<string, QueryValue>
): string {
  const search = buildSearch(query);
  return search ? `${pathname}${search}` : pathname;
}

export function toPath(url: AppRouterUrl): string {
  if (typeof url === "string") return url;

  const pathname = url.pathname ?? "";
  const query =
    "query" in url && url.query
      ? (url.query as Record<string, QueryValue>)
      : undefined;
  const hash = url.hash
    ? url.hash.startsWith("#")
      ? url.hash
      : `#${url.hash}`
    : "";

  return `${withQuery(pathname, query)}${hash}`;
}

export function isRelativePath(url: AppRouterUrl): boolean {
  return (
    typeof url === "object" &&
    "pathname" in url &&
    typeof url.pathname === "string" &&
    (url.pathname.startsWith("./") || url.pathname.startsWith("../"))
  );
}
