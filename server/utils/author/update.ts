import type { AuthorSchema } from "$server/models/author";
import type { AuthorsProps } from "$server/models/authorsProps";
import type { Topic, Book } from "@prisma/client";
import prisma from "$server/utils/prisma";
import type { Authorship } from "./authorToAuthorSchema";
import { authorArg, authorToAuthorSchema } from "./authorToAuthorSchema";
import findRoles from "./findRoles";
import insertAuthors from "./insertAuthors";

export function authorsUpdater(
  contentType: "topic" | "book",
  content: Pick<Topic | Book, "id"> & { authors: Array<Authorship> }
): {
  authors: Array<AuthorSchema>;
  updateAuthors(authors: AuthorsProps): Promise<Array<AuthorSchema>>;
} {
  const authors = content.authors.map(authorToAuthorSchema);
  async function updateAuthors({ authors }: AuthorsProps) {
    const roles = await findRoles();

    await prisma.$transaction([
      prisma.authorship.deleteMany({
        where: { [`${contentType}Id`]: content.id },
      }),
      insertAuthors(roles, contentType, content.id, authors),
    ]);

    const created = await prisma.authorship.findMany({
      ...authorArg,
      where: { [contentType]: { id: content.id } },
    });

    return created.map(authorToAuthorSchema);
  }

  return {
    authors,
    updateAuthors,
  };
}
