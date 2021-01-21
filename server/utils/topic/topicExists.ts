import { Topic } from "@prisma/client";
import prisma from "$server/utils/prisma";

function topicExists(topicId: Topic["id"]) {
  return prisma.topic.findUnique({
    where: { id: topicId },
    select: { creatorId: true },
  });
}

export default topicExists;
