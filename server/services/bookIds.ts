import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authInstructor from "$server/auth/authInstructor";
import authUser from "$server/auth/authUser";
import prisma from "$server/utils/prisma";

export const method = {
  get: {
    summary: "ブックID一覧",
    description: outdent`
      ブックIDの一覧を取得します。
      教員または管理者でなければなりません。`,
    response: {
      200: {
        type: "object",
        properties: {
          bookIds: {
            type: "array",
            item: { type: "string" },
          },
        },
      },
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function index(_: FastifyRequest) {
  const books = await prisma.book.findMany({
    select: { id: true },
  });
  const bookIds = books.flatMap(({ id }) => id);

  return {
    status: 200,
    body: { bookIds },
  };
}
