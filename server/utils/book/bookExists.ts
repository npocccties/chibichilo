import type { Book } from "@prisma/client";
import prisma from "$server/utils/prisma";

function bookExists(bookId: Book["id"]) {
  return prisma.book.findUnique({
    where: { id: bookId },
    select: { authorId: true },
  });
}

export default bookExists;
