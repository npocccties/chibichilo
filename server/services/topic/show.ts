import type { FastifySchema, FastifyRequest } from "fastify";
import { outdent } from "outdent";
import { topicSchema } from "$server/models/topic";
import type { TopicParams } from "$server/validators/topicParams";
import { topicParamsSchema } from "$server/validators/topicParams";
import authUser from "$server/auth/authUser";
import findTopic from "$server/utils/topic/findTopic";
import { isInstructor } from "$utils/session";

export const showSchema: FastifySchema = {
  summary: "トピックの取得",
  description: outdent`
    トピックの詳細を取得します。
    自身のブックマークに含まれるトピックか、教員または管理者でなければなりません。`,
  params: topicParamsSchema,
  response: {
    200: topicSchema,
    404: {},
  },
};

export const showHooks = {
  auth: [authUser],
};

export async function show({
  params,
  session,
}: FastifyRequest<{ Params: TopicParams }>) {
  const { topic_id: topicId } = params;

  const topic = await findTopic(topicId);

  const isBookmarked = topic?.bookmarks?.some((bookmark) => {
    return bookmark.userId === session.user.id;
  });

  if (!isInstructor(session) && !isBookmarked) {
    return {
      status: 403,
      body: null,
    };
  }

  return {
    status: topic == null ? 404 : 200,
    body: topic,
  };
}
