import { User, Book } from "@prisma/client";
import { BookProps, BookSchema } from "$server/models/book";
import { SectionProps } from "$server/models/book/section";
import prisma from "$server/utils/prisma";
import aggregateTimeRequired from "./aggregateTimeRequired";
import findBook from "./findBook";
import sectionCreateInput from "./sectionCreateInput";
import cleanupSections from "./cleanupSections";

function upsertSections(bookId: Book["id"], sections: SectionProps[]) {
  const sectionsCreateInput = sections.map(sectionCreateInput);
  return sectionsCreateInput.map((input, order) => {
    return prisma.section.create({
      data: { ...input, order, book: { connect: { id: bookId } } },
    });
  });
}

async function updateBook(
  authorId: User["id"],
  { id, ...book }: Pick<Book, "id"> & BookProps
): Promise<BookSchema | undefined> {
  const timeRequired = await aggregateTimeRequired(book);
  const cleanup = cleanupSections(id);
  const { sections, ...other } = book;
  const upsert = upsertSections(id, sections ?? []);
  const update = prisma.book.update({
    where: { id },
    data: {
      ...other,
      timeRequired,
      author: { connect: { id: authorId } },
      updatedAt: new Date(),
    },
  });

  await prisma.$transaction([...cleanup, ...upsert, update]);

  return findBook(id);
}

export default updateBook;
