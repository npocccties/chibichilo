import type { BookSchema } from "$server/models/book";
import type { PublicBookSchema } from "$server/models/book/public";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { IsContentEditable } from "$server/models/content";

export function isDisplayableBook(
  book: Pick<
    BookSchema,
    "id" | "shared" | "authors" | "release" | "ltiContextBookAccesses"
  >,
  isContentEditable: IsContentEditable | undefined,
  ltiResourceLink:
    | Pick<
        LtiResourceLinkSchema,
        "bookId" | "creatorId" | "consumerId" | "contextId"
      >
    | undefined,
  publicBook?: PublicBookSchema,
  currentLtiContext?: { ltiConsumerId?: string; ltiContextId?: string }
): boolean {
  if (isContentEditable?.(book)) {
    return true;
  }
  const consumerId =
    currentLtiContext?.ltiConsumerId ?? ltiResourceLink?.consumerId;
  const contextId =
    currentLtiContext?.ltiContextId ?? ltiResourceLink?.contextId;

  if (consumerId && contextId && book.ltiContextBookAccesses) {
    const access = book.ltiContextBookAccesses.find(
      (a) => a.consumerId === consumerId && a.contextId === contextId
    );
    if (access && !access.allowViewing) {
      return false;
    }
  }
  const linked = book.id === ltiResourceLink?.bookId;
  return Boolean(book.release?.shared || linked || publicBook);
}

export function getDisplayableBook<
  Book extends Pick<
    BookSchema,
    | "id"
    | "shared"
    | "authors"
    | "sections"
    | "release"
    | "ltiContextBookAccesses"
  >,
>(
  book: Book | undefined,
  isContentEditable: IsContentEditable | undefined,
  ltiResourceLink?: Pick<
    LtiResourceLinkSchema,
    "bookId" | "creatorId" | "instructors" | "consumerId" | "contextId"
  >,
  publicBook?: PublicBookSchema,
  isInstructor?: boolean | false,
  currentLtiContext?: { ltiConsumerId?: string; ltiContextId?: string }
): Book | undefined {
  if (book === undefined) return;

  if (
    !isInstructor &&
    !isDisplayableBook(
      book,
      isContentEditable,
      ltiResourceLink,
      publicBook,
      currentLtiContext
    )
  )
    return;

  return book;
}
