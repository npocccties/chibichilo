import { Prisma } from "@prisma/client";
import { TopicSchema } from "$server/models/topic";

export const topicsWithResourcesArg = {
  include: { resource: { include: { video: true } } },
} as const;

export type TopicWithResource = Prisma.TopicGetPayload<
  typeof topicsWithResourcesArg
>;

export function topicToTopicSchema(topic: TopicWithResource): TopicSchema {
  return {
    ...topic,
    resource: {
      ...topic.resource.video,
      ...topic.resource,
    },
  };
}
