import type { UserSchema } from "$server/models/user";
import type { BookSchema } from "$server/models/book";
import createBook from "./createBook";
import { cloneTopic } from "../topic/cloneTopic";
import prisma from "../prisma";
import type { Book, Prisma, Topic } from "@prisma/client";
import type { SectionSchema } from "$server/models/book/section";

async function cloneBookSections(
  sections: SectionSchema[],
  targetTopics: number[] | null | undefined,
  adjustTopic?: (orig: Topic["id"], target: Topic["id"]) => Promise<void>,
  authors?: Prisma.AuthorshipUncheckedCreateInput[]
)
{
  // トピックを複製する
  const topics = await Promise.all(
    sections
      .flatMap((section) => section.topics)
      .filter(({id}) => targetTopics?targetTopics.includes(id):true)
      .map(
        ({
          id,
          resourceId: _resourceId,
          bookmarks: _bookmarks,
          authors: _authors,
          details: _details,
          relatedBooks: _relatedBooks,
          ...topic
        }) => 
          cloneTopic(id, topic, authors).then(
            (created) => created && ([id, created] as const)
          )
      )
  );

  const topicsMap = new Map(
    topics.flatMap((created) => (created ? [created] : []))
  );

  const newSections = [];
  for (const section of sections) {
    const newTopics = [];
    for (const topic of section.topics) {
      const created = topicsMap.get(topic.id);
      if (created) {
        if (adjustTopic) {
          await adjustTopic(topic.id, created.id);
        }
        topic.id = created.id;
        newTopics.push(topic);
      }
    }
    if (newTopics.length > 0) {
      section.topics = newTopics;
      newSections.push(section);
    }
  }

  return newSections;
}

export async function cloneBook(
  parentBook: BookSchema,
  userId: UserSchema["id"],
  targetTopics: number[] | null | undefined,
  adjustBook?: (orig: Book["id"], target: Book["id"]) => Promise<void>,
  adjustTopic?: (orig: Topic["id"], target: Topic["id"]) => Promise<void>,
  authors?: Prisma.AuthorshipUncheckedCreateInput[]
): Promise<BookSchema | undefined> {
  const {
    id: _id,
    publicBooks: _publicBooks,
    ltiResourceLinks: _link,
    authors: _authors,
    release: _release,
    ...book
  } = structuredClone(parentBook);

  const newSections = await cloneBookSections(book.sections, targetTopics, adjustTopic, authors);
  book.sections = newSections;

  if (!authors) {
    authors = await prisma.authorship.findMany({
      where: { bookId: parentBook.id },
      select: { userId: true, roleId: true },
    });
  }

  const created = await createBook(userId, book, authors);
  if (!created) throw new Error(`ブックの複製に失敗 ${book.name}`);

  if (adjustBook) {
    await adjustBook(parentBook.id, created.id);
  }
  return created;
}
