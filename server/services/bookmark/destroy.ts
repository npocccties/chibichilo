import type { FastifyRequest, FastifySchema } from "fastify";
import authUser from "$server/auth/authUser";
import deleteBookmark from "$server/utils/bookmark/deleteBookmark";
import { BookmarkParams } from "$server/validators/bookmarkParams";
import findBookmark from "$server/utils/bookmark/findBookmark";

export const destroySchema: FastifySchema = {
  summary: "ブックマークの削除",
  description: `ブックマークを削除します。`,
  params: BookmarkParams,
  response: {
    204: { type: "null", description: "成功" },
    400: {},
    403: {},
  },
};

export const destroyHooks = {
  auth: [authUser],
};

export async function destroy({
  session,
  params,
}: FastifyRequest<{ Params: BookmarkParams }>) {
  const { id } = params;
  const bookmark = await findBookmark(id);

  if (!bookmark) {
    return {
      status: 400,
    };
  }

  if (bookmark.userId !== session.user.id) {
    return {
      status: 403,
    };
  }

  const deleted = await deleteBookmark({
    id,
  });

  if (!deleted) {
    return {
      status: 400,
    };
  }

  return {
    status: 204,
  };
}
