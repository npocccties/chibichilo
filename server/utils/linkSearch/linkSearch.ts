import type {
  Prisma,
  LtiResourceLink,
  LtiContext,
  Book,
  Authorship,
  ContentRole,
  User,
  Release,
} from "@prisma/client";
import type { LinkSearchResultSchema } from "$server/models/link/search";
import type { LinkSearchQuery } from "$server/models/link/searchQuery";
import type { LinkSchema } from "$server/models/link/content";
import type { AuthorFilter } from "$server/models/authorFilter";
import { AuthorSchema } from "$server/models/author";
import prisma from "$server/utils/prisma";
import createLinkScope from "./createLinkScope";
import { createScopesBook } from "../search/createScopes";
import makeSortLinkOrderQuery from "../makeSortLinkOrderQuery";

function linkToLinkSchema(
  link: LtiResourceLink & {
    context: LtiContext;
    book: Book & {
      authors: (Authorship & { role: ContentRole; user: User })[];
      release: Release | null;
    };
  }
): LinkSchema {
  const oauthClientId = link.consumerId;
  const createdAt = link.createdAt;
  const updatedAt = link.updatedAt;
  const ltiContext = {
    id: link.context.id,
    label: link.context.label,
    title: link.context.title,
  };
  const ltiResourceLink = {
    id: link.id,
    title: link.title,
  };
  const book = {
    id: link.book.id,
    name: link.book.name,
    shared: Boolean(link.book.release?.shared),
    authors: link.book.authors.map(({ user, role }) => ({
      id: user.id,
      ltiConsumerId: user.ltiConsumerId,
      ltiUserId: user.ltiUserId,
      name: user.name,
      roleName:
        AuthorSchema._roleNames[
          role.roleName as keyof typeof AuthorSchema._roleNames
        ] ?? role.roleName,
    })),
  };
  return {
    oauthClientId,
    createdAt,
    updatedAt,
    ltiContext,
    ltiResourceLink,
    book,
  };
}

/**
 * 検索クエリーによるリンク検索
 * @param query 検索クエリー
 * @param filter 著者フィルター
 * @param sort 並び順
 * @param page ページ番号
 * @param perPage 1ページあたりの表示件数
 * @param course.oauthClientId 配信されているLMS
 * @param course.ltiContextId LTI Context ID
 * @return リンク
 */
async function linkSearch(
  query: LinkSearchQuery,
  filter: AuthorFilter,
  sort: string,
  page: number,
  perPage: number,
  course: { oauthClientId: string; ltiContextId: string }
): Promise<LinkSearchResultSchema> {
  const insensitiveMode = { mode: "insensitive" as const };
  const where: Prisma.LtiResourceLinkWhereInput = {
    AND: [
      createLinkScope(filter, course),
      // NOTE: text - 検索文字列 (コース名、LTIリンク名、ブック名、トピック名)
      ...query.text.map((t) => ({
        OR: [
          {
            context: {
              title: { contains: t, ...insensitiveMode },
            },
          },
          {
            title: { contains: t, ...insensitiveMode },
          },
          {
            book: {
              AND: [
                ...createScopesBook(filter),
                {
                  OR: [
                    { name: { contains: t, ...insensitiveMode } },
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
                  ],
                },
              ],
            },
          },
        ],
      })),
      // NOTE: oauthClientId - 配信されているLMS
      ...query.oauthClientId.map((consumerId) => ({ consumerId })),
      // NOTE: link - リンクのタイトル
      ...query.linkTitle.map((t) => ({
        title: { contains: t, ...insensitiveMode },
      })),
      // // NOTE: book - ブックのタイトル
      ...query.bookName.map((t) => ({
        book: {
          AND: [
            ...createScopesBook(filter),
            { name: { contains: t, ...insensitiveMode } },
          ],
        },
      })),
      // // NOTE: topic - トピックのタイトル
      ...query.topicName.map((t) => ({
        book: {
          ...createScopesBook(filter),
          sections: {
            some: {
              topicSections: {
                some: {
                  topic: { name: { contains: t, ...insensitiveMode } },
                },
              },
            },
          },
        },
      })),
    ],
  };

  const totalCount = await prisma.ltiResourceLink.count({ where });
  const links = await prisma.ltiResourceLink.findMany({
    where,
    include: {
      context: true,
      book: {
        include: {
          authors: {
            include: {
              role: true,
              user: true,
            },
          },
          release: true,
        },
      },
    },
    orderBy: makeSortLinkOrderQuery(sort),
    skip: page * perPage,
    take: perPage,
  });

  const contents = links.map((link) => linkToLinkSchema(link));

  return { totalCount, contents, page, perPage };
}

export default linkSearch;
