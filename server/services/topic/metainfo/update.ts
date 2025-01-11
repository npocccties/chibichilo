import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isUsersOrAdmin } from "$server/utils/session";
import type { MetainfoProps } from "$server/models/metainfo";
import { metainfoProps } from "$server/models/metainfo";
import { updateTopicMetainfo } from "$server/utils/metainfo";
import type { TopicParams } from "$server/validators/topicParams";
import { topicParamsSchema } from "$server/validators/topicParams";
import findTopic from "$server/utils/topic/findTopic";

export const updateSchema: FastifySchema = {
  summary: "トピックのメタ情報の更新",
  description: outdent`
    トピックのメタ情報を更新します。
    教員または管理者でなければなりません。
    教員は自身の著作のトピックでなければなりません。`,
  params: topicParamsSchema,
  body: metainfoProps,
  response: {
    201: metainfoProps,
    403: {},
    404: {},
  },
};

export const updateHooks = {
  auth: [authUser, authInstructor],
};

export async function update({
  session,
  body,
  params,
}: FastifyRequest<{
  Body: MetainfoProps;
  Params: TopicParams;
}>) {
  const found = await findTopic(params.topic_id);

  if (!found) return { status: 404 };
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  const updated = await updateTopicMetainfo(params.topic_id, body);

  return {
    status: 201,
    body: updated,
  };
}
