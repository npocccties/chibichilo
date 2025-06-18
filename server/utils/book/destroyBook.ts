import type { Book } from "@prisma/client";
import prisma from "$server/utils/prisma";
import cleanupSections from "./cleanupSections";
import { findBookUniqueIds, updateBookSpid } from "../uniqueId";

async function destroyBook(id: Book["id"]) {
  try {
    const ops = [
      ...cleanupSections(id),
      prisma.ltiResourceLink.deleteMany({ where: { bookId: id } }),
      prisma.authorship.deleteMany({ where: { bookId: id } }),
      prisma.publicBook.deleteMany({ where: { bookId: id } }),
      prisma.book.deleteMany({ where: { id } }),
    ];
    const ids = await findBookUniqueIds(id);
    // unique id が見つかって、vid があるとき、spid を更新する
    if (ids && ids.vid) {
      ops.push(updateBookSpid(ids));
    }
    await prisma.$transaction(ops);
  } catch {
    return;
  }
}

export default destroyBook;
