import type { UserSchema } from "$server/models/user";
import type { BookSchema } from "$server/models/book";
import createBook from "./createBook";
import { cloneTopic } from "../topic/cloneTopic";
import prisma from "../prisma";

async function cloneBook(
  parentBook: BookSchema,
  userId: UserSchema["id"],
  targetTopics: number[] | null | undefined
): Promise<BookSchema | undefined> {
  // トピックを複製する
  const topics = await Promise.all(
    parentBook.sections
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
          cloneTopic(id, topic).then(
            (created) => created && ([id, created] as const)
          )
      )
  );

  const topicsMap = new Map(
    topics.flatMap((created) => (created ? [created] : []))
  );

  const {
    id: _id,
    publicBooks: _publicBooks,
    ltiResourceLinks: _link,
    authors: _authors,
    release: _release,
    ...book
  } = structuredClone(parentBook);

  const newSections = [];
  for (const section of book.sections) {
    const newTopics = [];
    for (const topic of section.topics) {
      const created = topicsMap.get(topic.id);
      if (created) {
        topic.id = created.id;
        newTopics.push(topic);
      }
    }
    if (newTopics.length > 0) {
      section.topics = newTopics;
      newSections.push(section);
    }
  }
  book.sections = newSections;

  const authors = await prisma.authorship.findMany({
    where: { bookId: parentBook.id },
    select: { userId: true, roleId: true },
  });

  const created = await createBook(userId, book, authors);
  if (!created) throw new Error(`ブックの複製に失敗 ${book.name}`);

  return created;
}

export default cloneBook;
