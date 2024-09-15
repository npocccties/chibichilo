import type { Book, Prisma, Release } from "@prisma/client";
import type { ReleaseProps } from "$server/models/book/release";
import prisma from "$server/utils/prisma";
import type { BookSchema } from "$server/models/book";
import { authorArg, authorToAuthorSchema } from "../author/authorToAuthorSchema";
import createScopes from "../search/createScopes";
import type { AuthorFilter } from "$server/models/authorFilter";
import type { ReleaseItemSchema } from "$server/models/releaseResult";

export async function upsertRelease(
  bookId: Book["id"],
  release: ReleaseProps
): Promise<Release | undefined> {
  return await prisma.release.upsert({
    where: { bookId },
    create: { bookId, ...release },
    update: { ...release },
  });
}

export async function updateRelease(
  bookId: Book["id"],
  release: ReleaseProps
): Promise<Release | undefined> {
  return await prisma.release.update({
    where: { bookId },
    data: { ...release },
  });
}

export async function createRelease(
  bookId: Book["id"],
  release: ReleaseProps
): Promise<Release | undefined> {
  return await prisma.release.create({
    data: {bookId, ...release},
  });
}

const bookIncludingArg = {
  select: {
    id: true,
    name: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    authors: authorArg,
    release: true,
  }
} as const;

export type BookWithRelease = Prisma.BookGetPayload<
  typeof bookIncludingArg
>;

export async function findReleasedBooks(
  book: BookSchema,
  userId: number,
): Promise<Array<BookWithRelease>> {
  const filter: AuthorFilter = {
    type: "all",
    by: userId,
    admin: false,
  };
  const where: Prisma.BookWhereInput = {
    AND: [
      ...createScopes(filter),
      { name: book.name },
    ],
    NOT: { release: null },
  };
  const found = await prisma.book.findMany({
    ...bookIncludingArg,
    where,
  })
  return found;
}

export function bookToReleaseItemSchema(
  { authors, release, ...book }: BookWithRelease
): ReleaseItemSchema | undefined {
  if (!release) return;
  return {
    ...book,
    authors: authors.map(authorToAuthorSchema),
    release: release,
  };
}