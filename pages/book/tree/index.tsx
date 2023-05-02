import { useRouter } from "next/router";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$templates/TopicNotFoundProblem";
import type { Query as BookEditQuery } from "../edit";
import { pagesPath } from "$utils/$path";
import useBookTree from "$utils/useBookTree";
import BookDiagram from "$templates/BookDiagram";
import { useSessionAtom } from "$store/session";
import { useBook } from "$utils/book";

export type Query = BookEditQuery;

function Tree({ bookId, context }: Query) {
  const { isContentEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isContentEditable);
  const { tree, error: error2 } = useBookTree(bookId);
  const router = useRouter();
  const bookEditQuery = { bookId, ...(context && { context }) };
  const back = () =>
    router.push(pagesPath.book.edit.$url({ query: bookEditQuery }));
  async function handleCancel() {
    return back();
  }
  const handlers = {
    onCancel: handleCancel,
  };

  console.log(tree);

  if (error || error2) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;
  if (!tree) return <Placeholder />;

  return <BookDiagram book={book} tree={tree} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Tree bookId={bookId} context={context} />;
}

export default Router;
