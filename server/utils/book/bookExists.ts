import type { Book } from "@prisma/client";
import prisma from "$server/utils/prisma";
import { authorArg } from "$server/utils/author/authorToAuthorSchema";
import { authorsUpdater } from "$server/utils/author/update";

async function bookExists(bookId: Book["id"]) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, authors: authorArg },
  });

  return (
    book && {
      ...book,
      ...authorsUpdater("book", book),
    }
  );
}

export default bookExists;
