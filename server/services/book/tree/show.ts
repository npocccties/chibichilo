import { outdent } from "outdent";
import type { FastifyRequest, FastifySchema } from "fastify";
import { TreeResultSchema } from "$server/models/book/tree";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import { isInstructor } from "$utils/session";

export const showSchema: FastifySchema = {
  summary: "ブックのツリー情報取得",
  description: outdent`
    ブックのツリー情報を取得します。
    教員または管理者いずれでもない場合、LTIリソースとしてリンクされているブックでなければなりません。`,
  params: bookParamsSchema,
  response: {
    200: TreeResultSchema,
    403: {},
    404: {},
  },
};

export const showHooks = {
  auth: [authUser],
};

export async function show({
  session,
  params,
}: FastifyRequest<{ Params: BookParams }>) {
  const { book_id: bookId } = params;

  if (!isInstructor(session) && session.ltiResourceLink?.bookId !== bookId) {
    return { status: 403 };
  }

  const tree = {
    rootId: 1,
    nodes: [],
  }

  return {
    status: 200,
    body: tree,
  }
}
