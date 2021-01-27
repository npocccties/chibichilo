import { BookSchema } from "$server/models/book";
import prisma from "$server/utils/prisma";
import {
  bookIncludingTopicsArg,
  bookToBookSchema,
} from "$server/utils/book/bookToBookSchema";

async function findBooks(page: number, perPage: number): Promise<BookSchema[]> {
  const books = await prisma.book.findMany({
    ...bookIncludingTopicsArg,
    skip: page * perPage,
    take: perPage,
  });

  return books.map(bookToBookSchema);
}

export default findBooks;
