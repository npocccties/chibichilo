import type { PublicBook } from "@prisma/client";

export type PublicBookSchema = Pick<
  PublicBook,
  "id" | "bookId" | "userId" | "domains" | "expireAt" | "token"
>;

export const publicBookSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    bookId: { type: "integer" },
    userId: { type: "integer" },
    domains: { type: "array", items: { type: "string" } },
    expireAt: { type: "string", nullable: true, format: "date-time" },
    token: { type: "string" },
  },
  nullable: true,
} as const;
