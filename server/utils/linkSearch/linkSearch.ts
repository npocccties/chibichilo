import type {
  Prisma,
  LtiResourceLink,
  LtiContext,
  Book,
  Authorship,
  ContentRole,
  User,
} from "@prisma/client";
import type { LinkSearchResultSchema } from "$server/models/link/search";
import type { LinkSearchQuery } from "$server/models/link/searchQuery";
import type { LinkSchema } from "$server/models/link/content";
import type { AuthorFilter } from "$server/models/authorFilter";
import { AuthorSchema } from "$server/models/author";
import prisma from "$server/utils/prisma";
import createLinkScope from "./createLinkScope";

function linkToLinkSchema(
  link: LtiResourceLink & {
    context: LtiContext;
    book: Book & {
      authors: (Authorship & { role: ContentRole; user: User })[];
    };
  }
): LinkSchema {
  const oauthClientId = link.consumerId;
  const createdAt = link.createdAt;
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
    shared: link.book.shared,
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
  return { oauthClientId, createdAt, ltiContext, ltiResourceLink, book };
}

/**
 * 検索クエリーによるリンク検索
 * @param query 検索クエリー
 * @param filter 著者フィルター
 * @param sort 並び順
 * @param page ページ番号
 * @param perPage 1ページあたりの表示件数
 * @param course.oauthClientId 提供されているLMS
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
      // NOTE: text - 検索文字列 (コース名)
      ...query.text.map((t) => ({
        context: {
          title: { contains: t, ...insensitiveMode },
        },
      })),
      // NOTE: oauthClientId - 提供されているLMS
      ...query.oauthClientId.map((consumerId) => ({ consumerId })),
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
        },
      },
    },
    orderBy: {
      createdAt: sort === "reverse-created" ? "asc" : "desc",
    },
    skip: page * perPage,
    take: perPage,
  });

  const contents = links.map((link) => linkToLinkSchema(link));

  return { totalCount, contents, page, perPage };
}

export default linkSearch;
