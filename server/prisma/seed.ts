import dotenv from "dotenv";
import prisma from "$server/utils/prisma";
import users from "$server/config/seeds/users";
import books from "$server/config/seeds/books";
import ltiResourceLinks from "$server/config/seeds/ltiResourceLinks";
import { upsertUser } from "$server/utils/user";
import upsertBook from "$server/utils/book/upsertBook";
import { upsertLtiResourceLink } from "$server/utils/ltiResourceLink";

dotenv.config();

async function main() {
  console.log("Seeding...");

  try {
    const createdUsers = await Promise.all(users.map(upsertUser));
    const createdBooks = await Promise.all(
      books
        .map((book) => ({ ...book, author: { id: createdUsers[0].id } }))
        .map(upsertBook)
    );

    await Promise.all(
      ltiResourceLinks
        .map((link) => ({ ...link, bookId: createdBooks[0].id }))
        .map(upsertLtiResourceLink)
    );
  } catch (error) {
    console.error(error.stack ?? error.message);
  }

  await prisma.$disconnect();

  console.log("Completed.");
  process.exit();
}

main();
