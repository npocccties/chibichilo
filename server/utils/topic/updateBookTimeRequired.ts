import type { Topic, Book } from "@prisma/client";
import prisma from "$server/utils/prisma";

async function bookTimeRequired(book: Pick<Book, "id">): Promise<number> {
  const aggregated = await prisma.topic.aggregate({
    where: { topicSection: { some: { section: { bookId: book.id } } } },
    _sum: { timeRequired: true },
  });
  const total = aggregated._sum.timeRequired ?? 0;
  return Math.floor(total);
}

/**
 * 学習時間の集計
 * 対象のトピックに関連するすべてのブックの学習時間を再計算し更新します
 */
async function updateBookTimeRequired(
  topicId: Topic["id"] | Topic["id"][]
): Promise<void> {
  const topicIdInput = {
    topicId: Array.isArray(topicId) ? { in: topicId } : topicId,
  };
  const books = await prisma.book.findMany({
    select: { id: true },
    where: {
      sections: {
        some: { topicSections: { some: topicIdInput } },
      },
    },
  });

  await Promise.all(
    books.map(async (book) => {
      const timeRequired = await bookTimeRequired(book);

      return await prisma.book.update({
        where: { id: book.id },
        data: { timeRequired },
      });
    })
  );
}

export default updateBookTimeRequired;
