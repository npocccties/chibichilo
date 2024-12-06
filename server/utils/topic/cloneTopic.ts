import type { Prisma, Topic } from "@prisma/client";
import type { TopicProps } from "$server/models/topic";
import prisma from "$server/utils/prisma";
import topicInput from "./topicInput";
import resourceConnectOrCreateInput from "./resourceConnectOrCreateInput";
import keywordsConnectOrCreateInput from "$server/utils/keyword/keywordsConnectOrCreateInput";

export async function cloneTopic(
  topicId: Topic["id"],
  topic : TopicProps,
  authors?: Prisma.AuthorshipUncheckedCreateInput[]
): Promise<Topic | undefined> {
  if (!authors) {
    authors = await prisma.authorship.findMany({
      where: { topicId },
      select: { userId: true, roleId: true },
    });
  }

  const created = await prisma.topic.create({
    data: {
      ...topicInput(topic),
      authors: { create: authors },
      resource: resourceConnectOrCreateInput(topic.resource),
      keywords: keywordsConnectOrCreateInput(topic.keywords ?? []),
    },
  });

  if (!created) return;

  const found = await prisma.topic.findUnique({
    where: { id: created.id },
  });

  if (!found) return;
  return found;
}

