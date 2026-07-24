import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import { TopicProps, topicSchema } from "$server/models/topic";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import createTopic from "$server/utils/topic/createTopic";
import isValidVideoResource from "$server/utils/isValidVideoResource";
import { WOWZA_BASE_URL } from "$server/utils/env";

export const createSchema: FastifySchema = {
  summary: "トピックの作成",
  description: outdent`
    トピックを作成します。
    教員または管理者でなければなりません。`,
  body: TopicProps,
  response: {
    201: topicSchema,
    400: {},
  },
};

export const createHooks = {
  auth: [authUser, authInstructor],
};

export async function create({
  protocol,
  hostname,
  session,
  body,
}: FastifyRequest<{
  Body: TopicProps;
}>) {
  const additionalProviderUrl = WOWZA_BASE_URL && `${protocol}://${hostname}/`;
  if (!isValidVideoResource(body.resource, additionalProviderUrl)) {
    return { status: 400 };
  }

  const created = await createTopic(session.user.id, body);

  return {
    status: created == null ? 400 : 201,
    body: created,
  };
}
