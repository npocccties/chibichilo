import type { Prisma } from "@prisma/client";
import { authorArg, authorToAuthorSchema } from "../author/authorToAuthorSchema";
import type { AuthorFilter } from "$server/models/authorFilter";
import { createScopesTopic } from "../search/createScopes";
import prisma from "../prisma";
import type { ReleaseItemSchema } from "$server/models/releaseResult";
import { selectUniqueIds } from "../uniqueId";
import type { UniqueIds } from "../uniqueId";

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
  ids: UniqueIds | undefined,
  userId: number,
): Promise<Array<TopicWithRelease>> {
  const filter: AuthorFilter = {
    type: "all",
    by: userId,
    admin: false,
  };
  if (!ids?.poid) return [];

  const where: Prisma.TopicWhereInput = {
    AND: [
      ...createScopesTopic(filter),
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
  ids: UniqueIds | undefined,
  { authors, topicSection, ...topic }: TopicWithRelease
): ReleaseItemSchema | undefined {
  // リリースされたトピック
  for (const ts of topicSection) {
    if (ts.section?.book?.release) {
      return {
        ...topic,
        authors: authors.map(authorToAuthorSchema),
        release: ts.section?.book?.release,
      };
    }
  }
  // 編集中トピック
  if (topic.oid === ids?.oid) {
    return {
      ...topic,
      authors: authors.map(authorToAuthorSchema),
    }
  }
  return undefined;
}
