import type { Book } from "@prisma/client";
import prisma from "$server/utils/prisma";

function cleanupSections(bookId: Book["id"]) {
  return [
    prisma.topicSection.deleteMany({ where: { section: { bookId } } }),
    prisma.section.deleteMany({ where: { bookId } }),
  ];
}

export default cleanupSections;
