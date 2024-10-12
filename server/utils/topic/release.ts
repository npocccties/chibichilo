import type { Prisma } from "@prisma/client";
import { authorArg, authorToAuthorSchema } from "../author/authorToAuthorSchema";
import type { TopicSchema } from "$server/models/topic";
import type { AuthorFilter } from "$server/models/authorFilter";
import createScopes from "../search/createScopes";
import prisma from "../prisma";
import type { ReleaseItemSchema } from "$server/models/releaseResult";
import { findTopicUniqueIds, selectUniqueIds } from "../uniqueId";

const topicIncludingArg = {
  select: {
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    authors: authorArg,
    topicSection: { include: { section: { include: { book: { include: { release: true } } } } } },
    ...selectUniqueIds,
  }
} as const;

export type TopicWithRelease = Prisma.TopicGetPayload<
  typeof topicIncludingArg
>;

export async function findReleasedTopics(
  topic: TopicSchema,
  userId: number,
): Promise<Array<TopicWithRelease>> {
  const filter: AuthorFilter = {
    type: "all",
    by: userId,
    admin: false,
  };
  const ids = await findTopicUniqueIds(topic.id);
  if (!ids?.poid) return [];

  const where: Prisma.TopicWhereInput = {
    AND: [
      ...createScopes(filter),
      { poid: ids.poid },
    ],
  };
  const found = await prisma.topic.findMany({
    ...topicIncludingArg,
    where,
  })
  return found;
}

export function topicToReleaseItemSchema(
  { authors, topicSection, ...topic }: TopicWithRelease
): ReleaseItemSchema | undefined {
  for (const ts of topicSection) {
    if (ts.section?.book?.release) {
      return {
        ...topic,
        authors: authors.map(authorToAuthorSchema),
        release: ts.section?.book?.release,
      };
    }
  }
  return undefined;
}
