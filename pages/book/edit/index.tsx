import { useRouter } from "next/router";
import type { BookSchema } from "$server/models/book";
import BookNotFoundProblem from "$templates/TopicNotFoundProblem";
import Placeholder from "$templates/Placeholder";
import BookEdit from "$templates/BookEdit";
import ReleasedBook from "$templates/ReleasedBook";
import BookFork from "$templates/BookFork";
import TopicPreviewDialog from "$organisms/TopicPreviewDialog";
import useBookEditHandlers from "$utils/useBookEditHandlers";

export type Query = {
  bookId: BookSchema["id"];
  context?: "books" | "topics" | "courses";
};

function Edit({ bookId, context }: Query) {
  const { error, book, topicPreviewDialogProps, ...handlers } =
    useBookEditHandlers({ bookId, context });

  if (error) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  const canEdit = handlers.isContentEditable(book);
  const Template = canEdit
    ? book.release
      ? ReleasedBook
      : BookEdit
    : BookFork;

  return (
    <>
      <Template book={book} {...handlers} />
      {topicPreviewDialogProps && (
        <TopicPreviewDialog {...topicPreviewDialogProps} />
      )}
    </>
  );
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Edit bookId={bookId} context={context} />;
}

export default Router;
