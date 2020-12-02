import { Resource, Topic, Video } from "@prisma/client";
import { TopicSchema } from "$server/models/topic";

export const topicsWithResourcesArg = {
  resource: { include: { video: true } },
} as const;

export type TopicWithResource = Topic & {
  resource: Resource & {
    video: Video | null;
  };
};

export function topicToTopicSchema(topic: TopicWithResource): TopicSchema {
  return {
    ...topic,
    resource: {
      ...topic.resource.video,
      ...topic.resource,
    },
  };
}
