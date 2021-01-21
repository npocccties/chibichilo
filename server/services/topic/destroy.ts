import { FastifySchema } from "fastify";
import { outdent } from "outdent";
import { TopicParams, topicParamsSchema } from "$server/validators/topicParams";
import { Session, isUserOrAdmin } from "$server/utils/session";
import topicExists from "$server/utils/topic/topicExists";
import destroyTopic from "$server/utils/topic/destroyTopic";

export const destroySchema: FastifySchema = {
  summary: "トピックの削除",
  description: outdent`
    トピックを削除します。
    教員または管理者でなければなりません。
    教員の場合は自身のトピックでなければなりません。`,
  params: topicParamsSchema,
  response: {
    204: { type: "null", description: "成功" },
    400: {},
    403: {},
    404: {},
  },
};

export async function destroy({
  session,
  params,
}: {
  session: Session;
  params: TopicParams;
}) {
  if (!session.user) return { status: 400 };

  const found = await topicExists(params.topic_id);

  if (!found) return { status: 404 };
  if (!isUserOrAdmin(session, { id: found.creatorId })) return { status: 403 };

  await destroyTopic(params.topic_id);

  return { status: 204 };
}
