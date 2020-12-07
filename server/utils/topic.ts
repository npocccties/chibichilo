import { User } from "@prisma/client";
import { TopicProps, TopicSchema } from "$server/models/topic";
import { ResourceProps } from "$server/models/resource";
import { parse } from "$server/utils/videoResource";
import prisma from "./prisma";
import {
  topicsWithResourcesArg,
  topicToTopicSchema,
} from "./topicToTopicSchema";

function resourceInput(resource: ResourceProps) {
  const videoProviderUrl = parse(resource.url)?.providerUrl;
  const videoCreateInput =
    videoProviderUrl == null
      ? undefined
      : { create: { providerUrl: videoProviderUrl, tracks: {} } };
  const resourceInput = {
    url: resource.url,
    details: {},
    video: videoCreateInput,
  };

  return {
    where: { url: resourceInput.url },
    create: resourceInput,
    update: resourceInput,
  };
}

function topicInput(topic: TopicProps & { creatorId: User["id"] }) {
  const { creatorId, ...props } = topic;

  return {
    ...props,
    details: {},
    creator: { connect: { id: creatorId } },
  };
}

export function topicCreateInput(
  topic: TopicProps & { creatorId: User["id"] }
) {
  const { where, create } = resourceInput(topic.resource);
  const topicCreateInput = {
    ...topicInput(topic),
    resource: { connectOrCreate: { where, create } },
  };

  return topicCreateInput;
}

export function topicUpdateInput(topic: TopicSchema) {
  const input = {
    ...topicInput(topic),
    resource: { upsert: resourceInput(topic.resource) },
  };

  return input;
}

export async function findTopics(
  page: number,
  perPage: number
): Promise<TopicSchema[]> {
  const topics = await prisma.topic.findMany({
    ...topicsWithResourcesArg,
    skip: page * perPage,
    take: perPage,
  });

  return topics.map(topicToTopicSchema);
}
