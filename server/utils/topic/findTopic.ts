import type { Topic } from "@prisma/client";
import type { TopicSchema } from "$server/models/topic";
import prisma from "$server/utils/prisma";
import {
  topicsWithResourcesArg,
  topicToTopicSchema,
} from "./topicToTopicSchema";

async function findTopic(
  topicId: Topic["id"]
): Promise<TopicSchema | undefined> {
  const topic = await prisma.topic.findUnique({
    ...topicsWithResourcesArg,
    where: { id: topicId },
  });
  if (topic == null) return;

  const relatedBooks = topic.topicSection.map((topicSection) => {
    const book = topicSection.section.book;
    return {
      id: book.id,
      name: book.name,
      description: book.description,
      language: book.language,
      shared: book.shared,
      release: book.release,
    };
  });

  return {
    ...topicToTopicSchema(topic),
    relatedBooks
  };
}

export default findTopic;
