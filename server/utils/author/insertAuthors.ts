import type { Topic, Book, ContentRole } from "@prisma/client";
import type { AuthorsProps } from "$server/models/authorsProps";
import type { AuthorSchema } from "$server/models/author";
import prisma from "$server/utils/prisma";

/**
 * コンテンツへの新しい著者の挿入
 * @param roles 役割一覧。roleName は実際の表示名。
 * @param contentType コンテンツの種類
 * @param contentId コンテンツの識別子
 * @param authors 著者。roleName は実際の表示名 (システムに存在しない場合: roleId 1)。著者の ID が重複している場合、最後に登録されたものを優先する。
 */
function insertAuthors<ContentType extends "topic" | "book">(
  roles: Array<ContentRole>,
  contentType: ContentType,
  contentId: ContentType extends "topic" ? Topic["id"] : Book["id"],
  authors: AuthorsProps["authors"]
) {
  const authorship = new Map<
    AuthorSchema["id"],
    {
      [contentId: string]: Topic["id"] | Book["id"];
      userId: AuthorSchema["id"];
      roleId: ContentRole["id"];
    }
  >();

  for (const author of authors) {
    authorship.delete(author.id);
    authorship.set(author.id, {
      [`${contentType}Id`]: contentId,
      userId: author.id,
      roleId: roles.find((role) => role.roleName === author.roleName)?.id ?? 1,
    });
  }

  return prisma.authorship.createMany({ data: [...authorship.values()] });
}

export default insertAuthors;
