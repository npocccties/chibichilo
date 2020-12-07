import { Book } from "@prisma/client";
import { BookSchema } from "$server/models/book";
import prisma from "$server/utils/prisma";
import {
  bookIncludingTopicsArg,
  bookToBookSchema,
} from "$server/utils/book/bookToBookSchema";

async function findBook(bookId: Book["id"]): Promise<BookSchema | undefined> {
  const book = await prisma.book.findUnique({
    ...bookIncludingTopicsArg,
    where: { id: bookId },
  });
  if (book == null) return;

  return bookToBookSchema(book);
}

export default findBook;
