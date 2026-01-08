import dotenv from "dotenv";
import prisma from "$server/utils/prisma";
import type { User } from "@prisma/client";
import type { BookSchema } from "$server/models/book";
import users from "$server/config/seeds/users";
import topics from "$server/config/seeds/topics";
import books from "$server/config/seeds/books";
import ltiResourceLinks from "$server/config/seeds/ltiResourceLinks";
import { upsertUser } from "$server/utils/user";
import upsertTopic from "$server/utils/topic/upsertTopic";
import createBook from "$server/utils/book/createBook";
import { upsertLtiResourceLink } from "$server/utils/ltiResourceLink";
import { upsertLtiConsumer } from "$server/utils/ltiConsumer";
import { OAUTH_CONSUMER_KEY, OAUTH_CONSUMER_SECRET } from "$server/utils/env";

async function seed() {
  const ltiConsumer = await upsertLtiConsumer(
    OAUTH_CONSUMER_KEY,
    OAUTH_CONSUMER_SECRET
  );

  const createdUsers: User[] = [];
  // TODO: upsert時の一意性の問題が解決したら `Promise.all()` 等に修正して。
  //       See also https://github.com/prisma/prisma/issues/3242
  for (const user of users) {
    const created = await upsertUser({
      ...user,
      ltiConsumerId: ltiConsumer.id,
    });
    createdUsers.push(created);
  }
  const creatorId = createdUsers[0].id;

  // TODO: upsert時の一意性の問題が解決したら `Promise.all()` 等に修正して。
  //       See also https://github.com/prisma/prisma/issues/3242
  for (const topic of topics) {
    await upsertTopic(creatorId, topic);
  }

  const createdBooks = (await Promise.all(
    books.map((book) => createBook(creatorId, book, [{ userId: creatorId, roleId: 1 }]))
  )) as BookSchema[];

  // TODO: upsert時の一意性の問題が解決したら `Promise.all()` 等に修正して。
  //       See also https://github.com/prisma/prisma/issues/3242
  for (const link of ltiResourceLinks) {
    await upsertLtiResourceLink({
      ...link,
      consumerId: ltiConsumer.id,
      bookId: createdBooks[0].id,
      creatorId,
    });
  }
}

async function main() {
  dotenv.config();
  let exitCode = 1;
  try {
    console.log("Seeding...");
    await seed();
    console.log("Seeding completed.");
    exitCode = 0;
  } catch (error) {
    console.error(
      error instanceof Error ? error.stack ?? error.message : error
    );
  } finally {
    await prisma.$disconnect();
    process.exit(exitCode);
  }
}

void main();
