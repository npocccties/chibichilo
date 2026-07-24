import crypto from "crypto";
import type { Book, PrismaPromise } from "@prisma/client";
import type { PublicBookSchema } from "$server/models/book/public";
import prisma from "$server/utils/prisma";
import {
  SESSION_SECRET,
  PUBLIC_ACCESS_HASH_ALGORITHM,
} from "$server/utils/env";

function upsertPublicBooks(
  userId: number,
  bookId: Book["id"],
  publicBooks: PublicBookSchema[]
) {
  const tokens: string[] = [];
  const ops: Array<PrismaPromise<unknown>> = [];
  for (const publicBook of publicBooks) {
    const token = generateToken(userId, bookId, publicBook);
    if (tokens.includes(token)) continue;

    tokens.push(token);
    const data = {
      book: { connect: { id: bookId } },
      user: { connect: { id: userId } },
      expireAt: publicBook.expireAt ?? null,
      domains: publicBook.domains,
      token,
    };
    const id = publicBook.id;
    if (id) {
      ops.push(prisma.publicBook.update({ where: { id }, data }));
    } else {
      ops.push(prisma.publicBook.create({ data }));
    }
  }
  return ops;
}

function generateToken(
  userId: number,
  bookId: Book["id"],
  publicBook: PublicBookSchema
) {
  const args = [`bookId=${bookId}`, `userId=${userId}`];
  if (publicBook.expireAt) {
    args.push(`expireAt=${publicBook.expireAt}`);
  }
  for (const domain of publicBook.domains) {
    args.push(`domain=${domain}`);
  }

  const hmac = crypto.createHmac(PUBLIC_ACCESS_HASH_ALGORITHM, SESSION_SECRET);
  hmac.update(args.join("&"));
  return hmac.digest().toString("base64url");
}

export default upsertPublicBooks;
