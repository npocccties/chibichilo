import type { UserSchema } from "$server/models/user";
import type { BookProps, BookSchema } from "$server/models/book";
import prisma from "$server/utils/prisma";
import aggregateTimeRequired from "./aggregateTimeRequired";
import findBook from "./findBook";
import sectionCreateInput from "./sectionCreateInput";
import keywordsConnectOrCreateInput from "$server/utils/keyword/keywordsConnectOrCreateInput";
import upsertPublicBooks from "$server/utils/publicBook/upsertPublicBooks";
import type { Prisma } from "@prisma/client";

async function createBook(
  userId: UserSchema["id"],
  { publicBooks, ...book }: BookProps,
  authors: Prisma.AuthorshipUncheckedCreateInput[]
): Promise<BookSchema | undefined> {
  const timeRequired = await aggregateTimeRequired(book);
  const sectionsCreateInput = book.sections?.map(sectionCreateInput) ?? [];

  const { id } = await prisma.book.create({
    data: {
      ...book,
      timeRequired,
      details: {},
      authors: { create: authors },
      sections: { create: sectionsCreateInput },
      keywords: keywordsConnectOrCreateInput(book.keywords ?? []),
    },
  });

  await prisma.$transaction(upsertPublicBooks(userId, id, publicBooks ?? []));

  return findBook(id, userId);
}

export default createBook;
