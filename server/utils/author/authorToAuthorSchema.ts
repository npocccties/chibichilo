import type { Prisma } from "@prisma/client";
import { AuthorSchema } from "$server/models/author";

export const authorArg = {
  include: { user: true, role: true },
  orderBy: { role: { id: "asc" } },
} as const;

export type Authorship = Prisma.AuthorshipGetPayload<typeof authorArg>;

export function authorToAuthorSchema(author: Authorship): AuthorSchema {
  const { settings: _, ...user } = author.user;
  // NOTE: 役割の表示名への変換
  const roleName =
    AuthorSchema._roleNames[
      author.role.roleName as keyof typeof AuthorSchema._roleNames
    ] ?? author.role.roleName;

  return {
    ...user,
    roleName,
  };
}
