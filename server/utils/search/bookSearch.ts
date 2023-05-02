import type { Prisma } from "@prisma/client";
import type { AuthorFilter } from "$server/models/authorFilter";
import type { SearchResultSchema } from "$server/models/search";
import {
  getBookIncludingArg,
  bookToBookSchema,
} from "$server/utils/book/bookToBookSchema";
import makeSortOrderQuery from "$server/utils/makeSortOrderQuery";
import prisma from "$server/utils/prisma";
import type { BookSearchQuery } from "$server/models/searchQuery";
import createScopes from "./createScopes";

/**
 * 検索クエリーによるブック検索
 * @param query 検索クエリー
 * @param filter 著者フィルター
 * @param sort 並び順
 * @param page ページ番号
 * @param perPage 1ページあたりの表示件数
 * @return ブック
 */
async function bookSearch(
  {
    text,
    name,
    description,
    author,
    partialKeyword,
    keyword,
    license,
    shared,
    link,
    book,
    latestRelease,
  }: BookSearchQuery,
  filter: AuthorFilter,
  sort: string,
  page: number,
  perPage: number,
  userId: number,
  ip: string
): Promise<SearchResultSchema> {
  const insensitiveMode = { mode: "insensitive" as const };
  const where: Prisma.BookWhereInput = {
    AND: [
      ...createScopes(filter),
      // NOTE: text - 検索文字列 (名称 OR 説明 OR 著者名 OR キーワード)
      ...text.map((t) => ({
        OR: [
          { name: { contains: t, ...insensitiveMode } },
          { description: { contains: t, ...insensitiveMode } },
          { sections: { some: { name: { contains: t, ...insensitiveMode } } } },
          {
            sections: {
              some: {
                topicSections: {
                  some: {
                    topic: {
                      name: { contains: t, ...insensitiveMode },
                    },
                  },
                },
              },
            },
          },
          {
            sections: {
              some: {
                topicSections: {
                  some: {
                    topic: { description: { contains: t, ...insensitiveMode } },
                  },
                },
              },
            },
          },
          {
            authors: {
              some: {
                user: { name: { contains: t, ...insensitiveMode } },
              },
            },
          },
          {
            keywords: {
              some: {
                name: { contains: t, ...insensitiveMode },
              },
            },
          },
        ],
      })),
      // NOTE: name - 名称 (ブック名・セクション名・トピック名)
      ...name.map((n) => ({
        OR: [
          { name: { contains: n, ...insensitiveMode } },
          { sections: { some: { name: { contains: n, ...insensitiveMode } } } },
          {
            sections: {
              some: {
                topicSections: {
                  some: {
                    topic: { name: { contains: n, ...insensitiveMode } },
                  },
                },
              },
            },
          },
        ],
      })),
      // NOTE: description - 説明 (Markdown)
      ...description.map((d) => ({
        OR: [
          { description: { contains: d, ...insensitiveMode } },
          {
            sections: {
              some: {
                topicSections: {
                  some: {
                    topic: { description: { contains: d, ...insensitiveMode } },
                  },
                },
              },
            },
          },
        ],
      })),
      // NOTE: author - 著者名
      ...author.map((a) => ({
        authors: {
          some: {
            user: { name: { contains: a, ...insensitiveMode } },
          },
        },
      })),
      // NOTE: partial-keyword - キーワード (部分一致)
      ...partialKeyword.map((pk) => ({
        keywords: { some: { name: { contains: pk, ...insensitiveMode } } },
      })),
      // NOTE: keyword - キーワード
      ...keyword.map((k) => ({
        keywords: { some: { name: k } },
      })),
      // NOTE: license - ライセンス
      ...license.map((l) => ({
        license: l,
      })),
      // NOTE: shared - 共有可否
      ...shared.map((s) => ({
        shared: s,
      })),
      // NOTE: link - 配信されているコース
      ...link.map((l) => ({
        ltiResourceLinks: { some: l },
      })),
      // NOTE: book - ブックID
      ...book.map((id) => ({
        id,
      })),
      // NOTE: latestRelease - 最新版のリリースのみ (デフォルト)、すべて
      ...(latestRelease.every((l) => l)
        ? [{ OR: [{ release: { is: null } }, { release: { latest: true } }] }]
        : []),
    ],
  };

  const totalCount = await prisma.book.count({ where });
  const books = await prisma.book.findMany({
    ...getBookIncludingArg(userId),
    where,
    orderBy: makeSortOrderQuery(sort),
    skip: page * perPage,
    take: perPage,
  });

  const contents = books
    .map((book) => bookToBookSchema(book, ip))
    .map((book) => ({ type: "book" as const, ...book }));

  return { totalCount, contents, page, perPage };
}

export default bookSearch;
