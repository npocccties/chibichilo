import type { FastifySchema } from "fastify";
import { outdent } from "outdent";
import { topicParamsSchema } from "$server/validators/topicParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import update from "$server/services/authors/update";

export const updateSchema: FastifySchema = {
  summary: "トピックの著者の更新",
  description: outdent`
    トピックの著者を更新します。
    教員または管理者でなければなりません。
    教員は自身の著作のトピックでなければなりません。`,
  params: topicParamsSchema,
  body: update.body,
  response: update.response,
};

export const updateHooks = {
  auth: [authUser, authInstructor],
};

export { update };
