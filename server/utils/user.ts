import type { Prisma, User } from "@prisma/client";
import type { UserProps } from "$server/models/user";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import prisma from "./prisma";
import makeSortOrderQuery from "./makeSortOrderQuery";
import {
  bookIncludingTopicsArg,
  bookToBookSchema,
} from "./book/bookToBookSchema";
import {
  topicsWithResourcesArg,
  topicToTopicSchema,
} from "./topic/topicToTopicSchema";

export async function upsertUser({ ltiConsumerId, ...user }: UserProps) {
  return await prisma.user.upsert({
    where: {
      ltiConsumerId_ltiUserId: {
        ltiConsumerId: ltiConsumerId,
        ltiUserId: user.ltiUserId,
      },
    },
    create: {
      ...user,
      ltiConsumer: { connect: { id: ltiConsumerId } },
    },
    update: {
      ltiUserId: user.ltiUserId,
      // NOTE: "" の場合 … 上書きしない https://www.prisma.io/docs/concepts/components/prisma-client/null-and-undefined
      name: user.name || undefined,
      email: user.email || undefined,
    },
  });
}

export async function findUserByEmailAndLtiConsumerId(
  email: User["email"],
  ltiConsumerId: User["ltiConsumerId"]
) {
  return await prisma.user.findFirst({ where: { email, ltiConsumerId } });
}

export async function findUserByLtiUserIdAndLtiConsumerId(
  ltiUserId: User["ltiUserId"],
  ltiConsumerId: User["ltiConsumerId"]
) {
  return await prisma.user.findFirst({ where: { ltiUserId, ltiConsumerId } });
}

export async function updateUserSettings(
  id: User["id"],
  settings: Prisma.JsonObject // NOTE: User["settings"] は null を含みうるがここでは期待しない
) {
  return await prisma.user.update({ where: { id }, data: { settings } });
}

export async function findUsersByEmail(email: User["email"]) {
  return await prisma.user.findMany({ where: { email } });
}

export async function findBooksBy(
  by: User["id"],
  sort = "updated",
  page: number,
  perPage: number
): Promise<BookSchema[]> {
  const authorship = await prisma.authorship.findMany({
    where: { userId: by },
    include: {
      book: bookIncludingTopicsArg,
    },
    orderBy: {
      book: makeSortOrderQuery(sort),
    },
    skip: page * perPage,
    take: perPage,
  });

  return authorship.flatMap(({ book }) =>
    book == null ? [] : [bookToBookSchema(book)]
  );
}

export async function findTopicsBy(
  by: User["id"],
  sort = "updated",
  page: number,
  perPage: number
): Promise<TopicSchema[]> {
  const authorship = await prisma.authorship.findMany({
    where: { userId: by },
    include: {
      topic: topicsWithResourcesArg,
    },
    orderBy: {
      topic: makeSortOrderQuery(sort),
    },
    skip: page * perPage,
    take: perPage,
  });

  return authorship.flatMap(({ topic }) =>
    topic == null ? [] : [topicToTopicSchema(topic)]
  );
}
