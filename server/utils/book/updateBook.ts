import type { Book, PrismaPromise, Prisma } from "@prisma/client";
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
import { cloneTopic } from "../topic/cloneTopic";
import { cloneTopicUniqueIds } from "../uniqueId";

function upsertSections(bookId: Book["id"], sections: SectionProps[]) {
  const sectionsCreateInput = sections.map(sectionCreateInput);
  return sectionsCreateInput.map((input, order) => {
    return prisma.section.create({
      data: { ...input, order, book: { connect: { id: bookId } } },
    });
  });
}

async function cloneSections(book: BookSchema, sections: SectionProps[], authors: Prisma.AuthorshipUncheckedCreateInput[]) {
  const origTopics = (book?.sections || [])
    .flatMap((section) => section.topics)
    .map((topic) => topic.id);
  for (const section of sections) {
    for (const topic of section.topics) {
      if (origTopics.includes(topic.id)) continue;
      const found = await prisma.topic.findUnique({
        where: { id: topic.id },
        include: { resource: true, keywords: true }
      });
      if (!found) continue;
      const { id: _id, resourceId: _resourceId, ...orig } = found;
      found.shared = false;
      const cloned = await cloneTopic(topic.id, orig, authors);
      if (cloned) {
        await cloneTopicUniqueIds(topic.id, cloned.id);
        topic.id = cloned.id;
      }
    }
  }
  return sections;
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
      sections = await cloneSections(origBook, sections, authors);
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
