import { FastifySchema } from "fastify";
import { topicSchema } from "$server/models/topic";
import { TopicParams, topicParamsSchema } from "$server/validators/topicParams";
import findTopic from "$server/utils/topic/findTopic";

export const showSchema: FastifySchema = {
  summary: "トピックの取得",
  description: "トピックの詳細を取得します。",
  params: topicParamsSchema,
  response: {
    200: topicSchema,
    404: {},
  },
};

export async function show({ params }: { params: TopicParams }) {
  const { topic_id: topicId } = params;
  const topic = await findTopic(topicId);

  return {
    status: topic == null ? 404 : 200,
    body: topic,
  };
}
