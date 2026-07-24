import type { FastifySchema } from "fastify";
import { outdent } from "outdent";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import update from "$server/services/authors/update";

export const updateSchema: FastifySchema = {
  summary: "ブックの著者の更新",
  description: outdent`
    ブックの著者を更新します。
    教員または管理者でなければなりません。
    教員は自身の著作のブックでなければなりません。`,
  params: bookParamsSchema,
  body: update.body,
  response: update.response,
};

export const updateHooks = {
  auth: [authUser, authInstructor],
};

export { update };
