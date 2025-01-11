import type { Book, Topic } from '@prisma/client';
import prisma from './prisma';
import type { MetainfoProps } from '$server/models/metainfo';

export async function updateBookMetainfo(
  bookId: Book["id"],
  metainfo: MetainfoProps
): Promise<void> {
  const _updated = await prisma.book.update({
    where: { id: bookId},
    data: metainfo,
  });
}

export async function updateTopicMetainfo(
  topicId: Topic["id"],
  metainfo: MetainfoProps
): Promise<void> {
  const _updated = await prisma.topic.update({
    where: { id: topicId},
    data: metainfo,
  });
}
