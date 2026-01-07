import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { BookProps } from "$server/models/book";
import { bookPropsSchema, bookSchema } from "$server/models/book";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import createBook from "$server/utils/book/createBook";
import { cloneSections } from "$server/utils/book/cloneSections";

export const createSchema: FastifySchema = {
  summary: "ブックの作成",
  description: outdent`
    ブックを作成します。
    教員または管理者でなければなりません。`,
  body: bookPropsSchema,
  response: {
    201: bookSchema,
    400: {},
  },
};

export const createHooks = {
  auth: [authUser, authInstructor],
};

export async function create({
  session,
  body,
}: FastifyRequest<{ Body: BookProps }>) {
  const authors = [{ userId: session.user.id, roleId: 1 }];
  if (body.sections) {
    body.sections = await cloneSections([], body.sections, authors);
  }
  const created = await createBook(session.user.id, body, authors);

  return {
    status: created == null ? 400 : 201,
    body: created,
  };
}
