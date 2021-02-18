import { Book } from "@prisma/client";
import prisma from "$server/utils/prisma";
import destroyTopic from "$server/utils/topic/destroyTopic";
import cleanupSections from "./cleanupSections";

async function destroyBook(id: Book["id"]) {
  const topicIds = (
    await prisma.topicSection.findMany({
      where: { section: { bookId: id } },
      select: { topicId: true },
    })
  ).map(({ topicId }) => topicId);

  try {
    await prisma.$transaction([
      ...cleanupSections(id),
      prisma.ltiResourceLink.deleteMany({ where: { bookId: id } }),
      prisma.book.deleteMany({ where: { id } }),
    ]);

    await Promise.all(topicIds.map(destroyTopic));
  } catch {
    return;
  }
}

export default destroyBook;
