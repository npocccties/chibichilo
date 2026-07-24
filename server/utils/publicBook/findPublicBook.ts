import type { PublicBook } from "@prisma/client";
import prisma from "$server/utils/prisma";

async function findPublicBook(
  token: PublicBook["token"],
  originreferer: string
): Promise<PublicBook | null> {
  const publicBook = await prisma.publicBook.findUnique({ where: { token } });
  if (!publicBook) return null;

  if (
    publicBook.expireAt &&
    publicBook.expireAt.getTime() < new Date().getTime()
  )
    return null;
  try {
    if (
      publicBook.domains.length &&
      !publicBook.domains.includes(new URL(originreferer).host)
    )
      return null;
  } catch (e) {
    return null;
  }

  return publicBook;
}

export default findPublicBook;
