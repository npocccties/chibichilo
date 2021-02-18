import { Book } from "@prisma/client";
import prisma from "$server/utils/prisma";
import cleanupSections from "./cleanupSections";

async function destroyBook(id: Book["id"]) {
  try {
    await prisma.$transaction([
      ...cleanupSections(id),
      prisma.ltiResourceLink.deleteMany({ where: { bookId: id } }),
      prisma.book.deleteMany({ where: { id } }),
    ]);
  } catch {
    return;
  }
}

export default destroyBook;
