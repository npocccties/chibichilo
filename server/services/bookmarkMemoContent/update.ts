import type { FastifySchema, FastifyRequest } from "fastify";
import authUser from "$server/auth/authUser";
import {
  bookmarkMemoContentPropsSchema,
  type BookmarkMemoContentProps,
} from "$server/models/bookmarkMemoContent";
import { BookmarkSchema } from "$server/models/bookmark";
import { BookmarkParams } from "$server/validators/bookmarkParams";
import updateBookmarkMemoContent from "$server/utils/bookmark/updateBookmarkMemoContent";

export const updateSchema: FastifySchema = {
  summary: "自由記述タグ(memoContent)が付与されたブックマークの更新",
  description: `自由記述タグが付与されたブックマークを更新します。`,
  params: BookmarkParams,
  body: bookmarkMemoContentPropsSchema,
  response: {
    201: BookmarkSchema,
    400: {},
  },
};

export const updateHooks = {
  auth: [authUser],
};

export async function update({
  session,
  params,
  body,
}: FastifyRequest<{ Body: BookmarkMemoContentProps; Params: BookmarkParams }>) {
  const updated = await updateBookmarkMemoContent({
    id: params.id,
    session,
    bookmark: body,
  });

  if (!updated) {
    return {
      status: 400,
    };
  }

  return {
    status: 201,
    body: updated,
  };
}
