import { Prisma, User, Book } from "@prisma/client";
import { BookProps, BookSchema } from "$server/models/book";
import { SectionProps } from "$server/models/book/section";
import prisma from "$server/utils/prisma";
import findBook from "./findBook";
import sectionCreateInput from "./sectionCreateInput";
import cleanupSections from "./cleanupSections";

function upsertSections(bookId: Book["id"], sections: SectionProps[]) {
  const sectionsCreateInput = sections.map(sectionCreateInput);
  return (sectionsCreateInput.map((input, order) => {
    return prisma.section.create({
      data: { ...input, order, book: { connect: { id: bookId } } },
    });
  }) as unknown) as Promise<Prisma.BatchPayload>[];
}

async function updateBook(
  authorId: User["id"],
  { sections, id, ...book }: Pick<Book, "id"> & BookProps
): Promise<BookSchema | undefined> {
  const cleanup = cleanupSections(id);
  const upsert = upsertSections(id, sections ?? []);
  const update = (prisma.book.update({
    where: { id },
    data: {
      ...book,
      author: { connect: { id: authorId } },
      updatedAt: new Date(),
    },
  }) as unknown) as Promise<Prisma.BatchPayload>;

  await prisma.$transaction([...cleanup, ...upsert, update]);

  return findBook(id);
}

export default updateBook;
