import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { TopicParams } from "$server/validators/topicParams";
import { topicParamsSchema } from "$server/validators/topicParams";
import authUser from "$server/auth/authUser";
import findTopic from "$server/utils/topic/findTopic";
import { isUsersOrAdmin } from "$utils/session";
import authInstructor from "$server/auth/authInstructor";
import { ReleaseResultSchema } from "$server/models/releaseResult";

export const showSchema: FastifySchema = {
  summary: "トピックのリリース一覧取得",
  description: outdent`
    トピックのリリース一覧を取得します。
    教員または管理者でなければなりません。
    教員は自身の著作のトピックでなければなりません。`,
  params: topicParamsSchema,
  response: {
    200: ReleaseResultSchema,
    403: {},
    404: {},
  },
};

export const showHooks = {
  auth: [authUser, authInstructor],
};

export async function show({
  params,
  session,
}: FastifyRequest<{ Params: TopicParams }>) {
  const found = await findTopic(params.topic_id);

  if (!found) return { status: 404 };
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  return {
    status: 200,
    body: found,
  };
}
