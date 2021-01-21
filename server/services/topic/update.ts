import { FastifySchema } from "fastify";
import {
  TopicProps,
  topicPropsSchema,
  topicSchema,
} from "$server/models/topic";
import type { UserSchema } from "$server/models/user";
import { TopicParams, topicParamsSchema } from "$server/validators/topicParams";
import upsertTopic from "$server/utils/topic/upsertTopic";
import { Session } from "$utils/session";
import { isAdministrator, verify } from "$server/utils/session";
import prisma from "$server/utils/prisma";

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

  const found = await prisma.topic.findUnique({
    where: { id: params.topic_id },
    select: { creatorId: true },
  });

  if (!found) return { status: 404 };
  if (!adminOrSelf(session, found.creatorId)) return { status: 403 };

  const created = await upsertTopic(session.user.id, {
    ...body,
    id: params.topic_id,
  });

  return {
    status: created == null ? 400 : 201,
    body: created,
  };
}

function adminOrSelf(session: Session, creatorId: UserSchema["id"]) {
  return verify(session, { id: creatorId }) || isAdministrator(session);
}
