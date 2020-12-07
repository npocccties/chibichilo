import { User } from "@prisma/client";
import { UserProps } from "$server/models/user";
import { BookSchema } from "$server/models/book";
import prisma from "./prisma";
import {
  bookIncludingTopicsArg,
  bookToBookSchema,
} from "./book/bookToBookSchema";

export async function upsertUser(user: UserProps) {
  return await prisma.user.upsert({
    where: { ltiUserId: user.ltiUserId },
    create: user,
    update: user,
  });
}

export async function findWrittenBooks(
  userId: User["id"],
  page: number,
  perPage: number
): Promise<BookSchema[]> {
  const user = prisma.user.findUnique({ where: { id: userId } });
  const books = await user.writtenBooks({
    ...bookIncludingTopicsArg,
    skip: page * perPage,
    take: perPage,
  });

  return books.map(bookToBookSchema);
}
