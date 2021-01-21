import { FastifySchema } from "fastify";
import {
  TopicProps,
  topicPropsSchema,
  topicSchema,
} from "$server/models/topic";
import { TopicParams, topicParamsSchema } from "$server/validators/topicParams";
import { Session, isUserOrAdmin } from "$server/utils/session";
import topicExists from "$server/utils/topic/topicExists";
import upsertTopic from "$server/utils/topic/upsertTopic";

export const updateSchema: FastifySchema = {
  description: "トピックの更新",
  params: topicParamsSchema,
  body: topicPropsSchema,
  response: {
    201: topicSchema,
    400: {},
    403: {},
    404: {},
  },
};

export async function update({
  session,
  body,
  params,
}: {
  session: Session;
  body: TopicProps;
  params: TopicParams;
}) {
  if (!session.user) return { status: 400 };

  const found = await topicExists(params.topic_id);

  if (!found) return { status: 404 };
  if (!isUserOrAdmin(session, { id: found.creatorId })) return { status: 403 };

  const created = await upsertTopic(session.user.id, {
    ...body,
    id: params.topic_id,
  });

  return {
    status: created == null ? 400 : 201,
    body: created,
  };
}
