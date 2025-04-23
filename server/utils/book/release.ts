import type { Book, Prisma, Release } from "@prisma/client";
import type { ReleaseProps } from "$server/models/book/release";
import prisma from "$server/utils/prisma";
import type { BookSchema } from "$server/models/book";
import { authorArg, authorToAuthorSchema } from "../author/authorToAuthorSchema";
import { createScopesBook } from "../search/createScopes";
import type { AuthorFilter } from "$server/models/authorFilter";
import type { ReleaseItemSchema } from "$server/models/releaseResult";
import { findBookUniqueIds, selectUniqueIds } from "../uniqueId";

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
    ...selectUniqueIds,
  }
} as const;

export type BookWithRelease = Prisma.BookGetPayload<
  typeof bookIncludingArg
>;

export async function findReleasedBooks(
  book: BookSchema,
  userId: number,
  admin: boolean,
): Promise<Array<BookWithRelease>> {
  const filter: AuthorFilter = {
    type: "all",
    by: userId,
    admin,
  };
  const ids = await findBookUniqueIds(book.id);
  if (!ids?.poid || !ids?.oid) return [];

  const where: Prisma.BookWhereInput = {
    AND: [
      ...createScopesBook(filter),
      {
        OR: [
          {
            AND: [
              { poid: ids.poid },
              { NOT: { release: null }},
            ]
          },
          {
            AND: [
              { oid: ids.oid },
              { release: null },
            ]
          }
        ]
      }
    ],
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
  const ret = {
    ...book,
    authors: authors.map(authorToAuthorSchema),
  };
  if (release !== null) {
    Object.assign(ret, { release });
  }
  return ret;
}

export async function findParentBook(
  book: BookSchema,
): Promise<Array<BookWithRelease>> {
  const ids = await findBookUniqueIds(book.id);
  if (!ids?.pid) return [];

  const where: Prisma.BookWhereInput = {
    OR: [
      { id: book.id },  // this book
      { vid: ids.pid }  // parent book
    ],
    NOT: { release: null },
  };
  const found = await prisma.book.findMany({
    ...bookIncludingArg,
    where,
  })
  return found;
}

