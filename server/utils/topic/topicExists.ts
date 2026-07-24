import type { Topic } from "@prisma/client";
import prisma from "$server/utils/prisma";
import { authorArg } from "$server/utils/author/authorToAuthorSchema";
import { authorsUpdater } from "$server/utils/author/update";

async function topicExists(topicId: Topic["id"]) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true, authors: authorArg },
  });

  return (
    topic && {
      ...topic,
      ...authorsUpdater("topic", topic),
    }
  );
}

export default topicExists;
