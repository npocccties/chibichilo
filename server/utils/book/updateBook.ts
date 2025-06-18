import type { Book, PrismaPromise } from "@prisma/client";
import type { BookProps, BookSchema } from "$server/models/book";
import type { SectionProps } from "$server/models/book/section";
import type { PublicBookSchema } from "$server/models/book/public";
import prisma from "$server/utils/prisma";
import aggregateTimeRequired from "./aggregateTimeRequired";
import findBook from "./findBook";
import sectionCreateInput from "./sectionCreateInput";
import cleanupSections from "./cleanupSections";
import keywordsConnectOrCreateInput from "$server/utils/keyword/keywordsConnectOrCreateInput";
import keywordsDisconnectInput from "$server/utils/keyword/keywordsDisconnectInput";
import upsertPublicBooks from "$server/utils/publicBook/upsertPublicBooks";
import { cloneSections } from "./cloneSections";

export function upsertSections(bookId: Book["id"], sections: SectionProps[]) {
  const sectionsCreateInput = sections.map(sectionCreateInput);
  return sectionsCreateInput.map((input, order) => {
    return prisma.section.create({
      data: { ...input, order, book: { connect: { id: bookId } } },
    });
  });
}

async function updateBook(
  userId: number,
  {
    id,
    sections,
    publicBooks,
    ...book
  }: Pick<Book, "id"> & BookProps,
  origBook: BookSchema,
  noclone?: boolean
): Promise<BookSchema | undefined> {
  const ops: Array<PrismaPromise<unknown>> = [];

  if (sections != null) {
    if (!noclone) {
      const authors = [{ userId: userId, roleId: 1 }];
      const origTopics = (origBook?.sections || [])
        .flatMap((section) => section.topics)
        .map((topic) => topic.id);
      sections = await cloneSections(origTopics, sections, authors);
    }
    const cleanup = cleanupSections(id);
    const upsert = upsertSections(id, sections);
    ops.push(...cleanup, ...upsert);
  }

  const timeRequired = sections && (await aggregateTimeRequired({ sections }));
  const keywordsBeforeUpdate = await prisma.keyword.findMany({
    where: { books: { some: { id } } },
  });
  const update = prisma.book.update({
    where: { id },
    data: {
      ...book,
      ...(timeRequired && { timeRequired }),
      keywords: {
        ...keywordsConnectOrCreateInput(book.keywords ?? []),
        ...keywordsDisconnectInput(keywordsBeforeUpdate, book.keywords ?? []),
      },
      updatedAt: new Date(),
    },
  });
  ops.push(update);

  ops.push(removePublicBooks(userId, id, publicBooks ?? []));
  ops.push(...upsertPublicBooks(userId, id, publicBooks ?? []));

  await prisma.$transaction(ops);

  return await findBook(id, userId);
}

function removePublicBooks(
  userId: number,
  bookId: Book["id"],
  publicBooks: PublicBookSchema[]
) {
  if (publicBooks.length) {
    return prisma.publicBook.deleteMany({
      where: {
        bookId,
        userId,
        id: {
          notIn: publicBooks
            .filter((publicBook) => publicBook.id != null)
            .map((publicBook) => publicBook.id),
        },
      },
    });
  } else {
    return prisma.publicBook.deleteMany({ where: { bookId, userId } });
  }
}

export default updateBook;
