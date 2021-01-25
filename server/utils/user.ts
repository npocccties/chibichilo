import type { User } from "@prisma/client";
import type { UserProps } from "$server/models/user";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import prisma from "./prisma";
import {
  bookIncludingTopicsArg,
  bookToBookSchema,
} from "./book/bookToBookSchema";
import {
  topicsWithResourcesArg,
  topicToTopicSchema,
} from "./topic/topicToTopicSchema";

export async function upsertUser(user: UserProps) {
  return await prisma.user.upsert({
    where: { ltiUserId: user.ltiUserId },
    create: user,
    update: user,
  });
}

export async function findWrittenBooks(
  userId: User["id"],
  page: number,
  perPage: number
): Promise<BookSchema[]> {
  const user = prisma.user.findUnique({ where: { id: userId } });
  const books = await user.writtenBooks({
    ...bookIncludingTopicsArg,
    skip: page * perPage,
    take: perPage,
  });

  return books.map(bookToBookSchema);
}

export async function findCreatedTopics(
  userId: User["id"],
  page: number,
  perPage: number
): Promise<TopicSchema[]> {
  const user = prisma.user.findUnique({ where: { id: userId } });
  const topics = await user.createdTopics({
    ...topicsWithResourcesArg,
    skip: page * perPage,
    take: perPage,
  });

  return topics.map(topicToTopicSchema);
}
