import type { Book } from "@prisma/client";
import prisma from "$server/utils/prisma";
import cleanupSections from "./cleanupSections";
import { updateBookSpid } from "../uniqueId";

async function destroyBook(id: Book["id"]) {
  await updateBookSpid(id);
  try {
    await prisma.$transaction([
      ...cleanupSections(id),
      prisma.ltiResourceLink.deleteMany({ where: { bookId: id } }),
      prisma.authorship.deleteMany({ where: { bookId: id } }),
      prisma.publicBook.deleteMany({ where: { bookId: id } }),
      prisma.book.deleteMany({ where: { id } }),
    ]);
  } catch {
    return;
  }
}

export default destroyBook;
