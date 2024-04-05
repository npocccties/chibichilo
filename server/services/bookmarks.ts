import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import { BookmarkTagMenu, BookmarkSchema } from "$server/models/bookmark";
import { BookmarkQuery } from "$server/validators/bookmarkQuery";
import authUser from "$server/auth/authUser";
import findBookmarks from "$server/utils/bookmark/findBookmarks";

export const method = {
  get: {
    summary: "ブックマーク一覧",
    description: outdent`
    ブックマークの一覧を取得します。
    isAllUsers が true の場合、全ユーザーのブックマークを取得します。
    isAllUsers が false の場合、該当のユーザーのブックマークを取得します。
    `,
    querystring: BookmarkQuery,
    response: {
      200: {
        description: "成功時",
        type: "object",
        properties: {
          bookmark: { type: "array", items: BookmarkSchema },
          bookmarkTagMenu: BookmarkTagMenu,
        },
        required: ["bookmark"],
      },
      404: {},
    },
  },
} as const;

export type Query = BookmarkQuery;

export const hooks = {
  get: { auth: [authUser] },
};

export async function index({
  query,
  session,
}: FastifyRequest<{ Querystring: Query }>) {
  const { topicId, tagIds, isExistMemoContent, isAllUsers } = query;

  if (topicId !== undefined) {
    const bookmarks = await findBookmarks({
      ltiContextId: session.ltiContext.id,
      ltiConsumerId: session.oauthClient.id,
      topicId,
      userId: isAllUsers ? undefined : session.user.id,
    });

    return {
      status: 200,
      body: bookmarks,
    };
  } else if (tagIds !== undefined || isExistMemoContent) {
    const params = new URLSearchParams(tagIds);
    const ids = params.getAll("tagIds").map(Number);

    const bookmarks = await findBookmarks({
      ltiContextId: session.ltiContext.id,
      ltiConsumerId: session.oauthClient.id,
      tagIds: ids,
      isExistMemoContent,
      userId: isAllUsers ? undefined : session.user.id,
    });

    return {
      status: 200,
      body: bookmarks,
    };
  } else {
    return { status: 404 };
  }
}
