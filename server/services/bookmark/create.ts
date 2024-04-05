import type { FastifySchema, FastifyRequest } from "fastify";
import authUser from "$server/auth/authUser";
import createBookmark from "$server/utils/bookmark/createBookmark";
import {
  bookmarkPropsSchema,
  BookmarkSchema,
  type BookmarkProps,
} from "$server/models/bookmark";

export const createSchema: FastifySchema = {
  summary: "ブックマークの作成",
  description: `ブックマークを作成します。`,
  body: bookmarkPropsSchema,
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
}: FastifyRequest<{ Body: BookmarkProps }>) {
  const created = await createBookmark({
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
