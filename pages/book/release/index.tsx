import { useRouter } from "next/router";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$templates/BookNotFoundProblem";
import { useSessionAtom } from "$store/session";
import { createReleaseBook, useBook } from "$utils/book";
import type { Query as BookEditQuery } from "../edit";
import { pagesPath } from "$utils/$path";
import ReleaseEdit from "$templates/ReleaseEdit";
import type { ReleaseProps } from "$server/models/book/release";

export type Query = BookEditQuery;

function Release({ bookId, context }: Query) {
  const { isContentEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isContentEditable);
  const router = useRouter();
  async function handleSubmit(release: ReleaseProps) {
    if (!book) return;
    const created = await createReleaseBook({ id: bookId, ...release });
    return router.push(
      pagesPath.book.edit.$url({
        query: { bookId: created.id, ...(context && { context }) },
      })
    );
  }
  const handlers = {
    onSubmit: handleSubmit,
  };

  if (error) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  return <ReleaseEdit book={book} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Release bookId={bookId} context={context} />;
}

export default Router;
