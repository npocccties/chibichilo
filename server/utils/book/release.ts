import type { Book, Release } from "@prisma/client";
import type { ReleaseProps } from "$server/models/book/release";
import prisma from "$server/utils/prisma";

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
