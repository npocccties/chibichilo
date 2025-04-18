import type { BookSchema } from "$server/models/book";
import type { PublicBookSchema } from "$server/models/book/public";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { IsContentEditable } from "$server/models/content";

export function isDisplayableBook(
  book: Pick<BookSchema, "id" | "shared" | "authors" | "release">,
  isContentEditable: IsContentEditable | undefined,
  ltiResourceLink:
    | Pick<LtiResourceLinkSchema, "bookId" | "creatorId">
    | undefined,
  publicBook?: PublicBookSchema
) {
  const linked = book.id === ltiResourceLink?.bookId;
  return (
    book.release?.shared || linked || isContentEditable?.(book) || publicBook
  );
}

export function getDisplayableBook<
  Book extends Pick<
    BookSchema,
    "id" | "shared" | "authors" | "sections" | "release"
  >,
>(
  book: Book | undefined,
  isContentEditable: IsContentEditable | undefined,
  ltiResourceLink?: Pick<LtiResourceLinkSchema, "bookId" | "creatorId">,
  publicBook?: PublicBookSchema,
  isInstructor?: boolean | false
): Book | undefined {
  if (book === undefined) return;
  if (
    !isInstructor &&
    !isDisplayableBook(book, isContentEditable, ltiResourceLink, publicBook)
  )
    return;

  return book;
}
