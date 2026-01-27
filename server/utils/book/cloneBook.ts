import type { UserSchema } from "$server/models/user";
import type { BookSchema } from "$server/models/book";
import createBook from "./createBook";
import { cloneTopic } from "../topic/cloneTopic";
import prisma from "../prisma";
import type { Prisma, Topic } from "@prisma/client";
import type { SectionSchema } from "$server/models/book/section";
import { cloneBookUniqueIds, cloneTopicUniqueIds, releaseBookUniqueIds, releaseTopicUniqueIds } from "../uniqueId";

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

export async function cloneRelease(
  parentBook: BookSchema,
  userId: UserSchema["id"],
): Promise<BookSchema | undefined> {
  const {
    id: _id,
    publicBooks: _publicBooks,
    ltiResourceLinks: _link,
    authors: _authors,
    release: _release,
    shared: _shared,
    ...book
  } = structuredClone(parentBook);

  // トピックを複製する, 作成者も複製する
  const newSections = await cloneBookSections(book.sections, null, releaseTopicUniqueIds);
  book.sections = newSections;

  // ブックの作成者を複製する
  const authors = await prisma.authorship.findMany({
    where: { bookId: parentBook.id },
    select: { userId: true, roleId: true },
  });

  // 新規ブックの作成
  const created = await createBook(userId, book, authors);
  if (!created) throw new Error(`ブックのリリースに失敗 ${book.name}`);

  await releaseBookUniqueIds(parentBook.id, created.id);

  return parentBook;
}

export async function cloneBook(
  parentBook: BookSchema,
  userId: UserSchema["id"],
): Promise<BookSchema | undefined> {
  const {
    id: _id,
    publicBooks: _publicBooks,
    ltiResourceLinks: _link,
    authors: _authors,
    release: _release,
    shared: _shared,
    ...book
  } = structuredClone(parentBook);

  // ブック、トピックの作成者を自分にする
  const authors = [{ userId, roleId: 1 }];
  const newSections = await cloneBookSections(book.sections, null, cloneTopicUniqueIds, authors);
  book.sections = newSections;

  const created = await createBook(userId, book, authors);
  if (!created) throw new Error(`ブックの複製に失敗 ${book.name}`);

  await cloneBookUniqueIds(parentBook.id, created.id);

  return created;
}
