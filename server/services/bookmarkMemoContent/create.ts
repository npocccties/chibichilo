import type { FastifySchema, FastifyRequest } from "fastify";
import authUser from "$server/auth/authUser";
import {
  bookmarkMemoContentPropsSchema,
  type BookmarkMemoContentProps,
} from "$server/models/bookmarkMemoContent";
import { BookmarkSchema } from "$server/models/bookmark";
import createBookmarkMemoContent from "$server/utils/bookmark/createBookmarkMemoContent";

export const createSchema: FastifySchema = {
  summary: "自由記述タグ(memoContent)が付与されたブックマーク作成",
  description: `自由記述タグが付与されたブックマークを作成します。`,
  body: bookmarkMemoContentPropsSchema,
  response: {
    201: BookmarkSchema,
    400: {},
  },
};

export const createHooks = {
  auth: [authUser],
};

export async function create({
  session,
  body,
}: FastifyRequest<{ Body: BookmarkMemoContentProps }>) {
  const created = await createBookmarkMemoContent({
    session,
    bookmark: body,
  });

  if (!created) {
    return {
      status: 400,
    };
  }

  return {
    status: 201,
    body: created,
  };
}
