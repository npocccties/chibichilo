import { useAppRouter } from "$utils/useAppRouter";
import TopicNew from "$templates/TopicNew";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$templates/BookNotFoundProblem";
import type { Query as BookEditQuery } from "$pages/book/edit";
import { useSessionAtom } from "$store/session";
import { useBook } from "$utils/book";
import useTopicNewHandlers from "$utils/useTopicNewHandlers";

export type Query = Partial<BookEditQuery>;

function New({ context }: Query) {
  const handlers = useTopicNewHandlers(context);

  return <TopicNew {...handlers} />;
}

function NewWithBook({ bookId, context }: BookEditQuery) {
  const { isContentEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isContentEditable);
  const handlers = useTopicNewHandlers(context, book);

  if (error) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  return <TopicNew {...handlers} />;
}

function Router() {
  const router = useAppRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<BookEditQuery, "context"> = router.query;

  if (Number.isFinite(bookId)) {
    return <NewWithBook bookId={bookId} context={context} />;
  }

  return <New context={context} />;
}

export default Router;
