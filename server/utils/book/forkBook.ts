import type { UserSchema } from "$server/models/user";
import type { BookSchema } from "$server/models/book";
import prisma from "$server/utils/prisma";
import createTopic from "$server/utils/topic/createTopic";
import createBook from "./createBook";
import findBook from "./findBook";

async function forkBook(
  userId: UserSchema["id"],
  bookId: BookSchema["id"]
): Promise<BookSchema | undefined> {
  const parentBook = await findBook(bookId, userId, "");
  if (!parentBook) return;

  const parent = await prisma.node.findUnique({ where: { id: parentBook.id } });
  if (!parent) throw new Error(`Node 取得に失敗 ${parentBook.id}`);

  const topics = await Promise.all(
    parentBook.sections
      .flatMap((section) => section.topics)
      .map(
        ({
          id,
          resourceId: _resourceId,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          details: _details,
          authors: _authors,
          relatedBooks: _relatedBooks,
          ...topic
        }) =>
          createTopic(userId, topic, "").then(
            (created) => created && ([id, created] as const)
          )
      )
  );

  const topicsMap = new Map(
    topics.flatMap((created) => (created ? [created] : []))
  );

  const {
    id: _id,
    ltiResourceLinks: _link,
    ...book
  } = structuredClone(parentBook);

  for (const section of book.sections) {
    for (const topic of section.topics) {
      const topicId = topicsMap.get(topic.id)?.id;
      if (topicId == null) throw new Error(`トピックの作成に失敗 ${topicId}`);

      topic.id = topicId;
    }
  }

  const created = await createBook(userId, book, "");
  if (!created) throw new Error(`ブックのフォークに失敗 ${book.name}`);

  await prisma.node.update({
    where: { id: created.id },
    data: {
      rootId: parent.rootId ?? parent.id,
      parentId: parent.id,
    },
  });

  const byAuthor = parentBook.authors.some((author) => author.id === userId);
  if (byAuthor) {
    await prisma.release.update({
      where: { bookId: parentBook.id },
      data: { latest: false },
    });
  }

  return created;
}

export default forkBook;
