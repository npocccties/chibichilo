import { FastifySchema } from "fastify";
import { BookProps, bookPropsSchema, bookSchema } from "$server/models/book";
import createBook from "$server/utils/book/createBook";
import { Session } from "$utils/session";
import { outdent } from "outdent";

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

export async function create({
  session,
  body,
}: {
  session: Session;
  body: BookProps;
}) {
  if (!session.user) return { status: 400 };

  const created = await createBook(session.user.id, body);

  return {
    status: created == null ? 400 : 201,
    body: created,
  };
}
