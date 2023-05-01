import { useRouter } from "next/router";
import BookImport from "$templates/BookImport";
import Placeholder from "$templates/Placeholder";
import Book from "$templates/Book";
import BookPreviewDialog from "$organisms/BookPreviewDialog";
import BookNotFoundProblem from "$templates/TopicNotFoundProblem";
import { useSessionAtom } from "$store/session";
import { updateBook, useBook } from "$utils/book";
import useBooks from "$utils/useBooks";
import type { BookSchema } from "$server/models/book";
import type { SectionSchema } from "$server/models/book/section";
import type { TopicSchema } from "$server/models/topic";
import type { Query as BookEditQuery } from "../edit";
import { pagesPath } from "$utils/$path";
import useDialogProps from "$utils/useDialogProps";
import type { ContentAuthors } from "$server/models/content";

export type Query = BookEditQuery;

function Import({ bookId, context }: Query) {
  const { isContentEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isContentEditable);
  const booksProps = useBooks();
  const router = useRouter();
  const bookEditQuery = { bookId, ...(context && { context }) };
  const {
    data: dialog,
    open,
    onClose,
    dispatch,
  } = useDialogProps<BookSchema>();
  const back = () =>
    router.push(pagesPath.book.edit.$url({ query: bookEditQuery }));
  async function handleSubmit({
    topics,
  }: {
    books: BookSchema[];
    sections: SectionSchema[];
    topics: TopicSchema[];
  }) {
    if (!book) return;

    const ids = topics.map(({ id }) => id);
    await updateBook({
      ...book,
      sections: [...book.sections, ...ids.map((id) => ({ topics: [{ id }] }))],
    });

    return back();
  }
  function handleCancel() {
    return back();
  }
  function handleBookPreviewClick(book: BookSchema) {
    dispatch(book);
  }
  function handleBookEditClick(book: Pick<BookSchema, "id"> & ContentAuthors) {
    return router.push(
      pagesPath.book.edit.$url({
        // NOTE: ブック編集画面は元のブックインポート画面に戻る手段が無いのでブック一覧画面に戻る
        query: { bookId: book.id, context: "books" },
      })
    );
  }
  function handleTopicEditClick(topic: Pick<TopicSchema, "id">) {
    return router.push(
      pagesPath.book.import.topic.edit.$url({
        query: { ...bookEditQuery, topicId: topic.id },
      })
    );
  }
  const handlers = {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onBookPreviewClick: handleBookPreviewClick,
    onBookEditClick: handleBookEditClick,
    onTopicEditClick: handleTopicEditClick,
    isContentEditable,
  };

  if (error) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  return (
    <>
      <BookImport {...booksProps} {...handlers} />
      {dialog && (
        <BookPreviewDialog open={open} onClose={onClose} book={dialog}>
          {(props) => <Book {...props} onOtherBookLinkClick={onClose} />}
        </BookPreviewDialog>
      )}
    </>
  );
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Import bookId={bookId} context={context} />;
}

export default Router;
