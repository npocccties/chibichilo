import type { User, Topic } from "@prisma/client";
import type { TopicProps, TopicSchema } from "$server/models/topic";
import type { KeywordSchema } from "$server/models/keyword";
import prisma from "$server/utils/prisma";
import {
  topicsWithResourcesArg,
  topicToTopicSchema,
} from "./topicToTopicSchema";
import topicInput from "./topicInput";
import resourceConnectOrCreateInput from "./resourceConnectOrCreateInput";
import topicCreateInput from "./topicCreateInput";
import keywordsConnectOrCreateInput from "$server/utils/keyword/keywordsConnectOrCreateInput";
import keywordsDisconnectInput from "../keyword/keywordsDisconnectInput";

function topicUpdateInput(topic: TopicProps, keywords: KeywordSchema[]) {
  const input = {
    ...topicInput(topic),
    resource: resourceConnectOrCreateInput(topic.resource),
    keywords: {
      ...keywordsConnectOrCreateInput(topic.keywords ?? []),
      ...keywordsDisconnectInput(keywords, topic.keywords ?? []),
    },
  };

  return input;
}

async function upsertTopic(
  authorId: User["id"],
  { id, ...topic }: TopicProps & Pick<Topic, "id">
): Promise<TopicSchema | undefined> {
  const keywordsBeforeUpdate = await prisma.keyword.findMany({
    where: { topics: { some: { id } } },
  });
  const created = await prisma.topic.upsert({
    ...topicsWithResourcesArg,
    where: { id },
    create: topicCreateInput(authorId, topic),
    update: topicUpdateInput(topic, keywordsBeforeUpdate),
  });

  if (!created) return;

  return topicToTopicSchema(created);
}

export default upsertTopic;
