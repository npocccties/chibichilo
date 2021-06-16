import { useRouter } from "next/router";
import type { BookSchema } from "$server/models/book";
import { useSessionAtom } from "$store/session";
import BooksTemplate from "$templates/Books";
import Book from "$templates/Book";
import BookPreviewDialog from "$organisms/BookPreviewDialog";
import useBooks from "$utils/useBooks";
import useLinkedBook from "$utils/useLinkedBook";
import { pagesPath } from "$utils/$path";
import { updateLtiResourceLink } from "$utils/ltiResourceLink";
import getLtiResourceLink from "$utils/getLtiResourceLink";
import useDialogProps from "$utils/useDialogProps";

const Books = (
  props: Omit<
    Parameters<typeof BooksTemplate>[0],
    keyof ReturnType<typeof useBooks>
  >
) => <BooksTemplate {...props} {...useBooks()} />;

function Index() {
  const router = useRouter();
  const { session, isBookEditable } = useSessionAtom();
  const { linkedBook } = useLinkedBook();
  const {
    data: dialog,
    open,
    onClose,
    dispatch,
  } = useDialogProps<BookSchema>();
  const handleBookClick = (book: BookSchema) => dispatch(book);
  const handleBookEditClick = (book: Pick<BookSchema, "id" | "author">) => {
    const action = isBookEditable(book) ? "edit" : "generate";
    return router.push(
      pagesPath.book[action].$url({
        query: { context: "books", bookId: book.id },
      })
    );
  };
  const handleBookNewClick = () => {
    return router.push(
      pagesPath.book.new.$url({ query: { context: "books" } })
    );
  };
  const handleBookLinkClick = async (book: Pick<BookSchema, "id">) => {
    const ltiResourceLink = getLtiResourceLink(session);
    if (ltiResourceLink == null) return;
    const bookId = book.id;
    await updateLtiResourceLink({ ...ltiResourceLink, bookId });
    return router.push(pagesPath.book.$url({ query: { bookId } }));
  };
  const handlers = {
    onBookClick: handleBookClick,
    onBookEditClick: handleBookEditClick,
    onBookNewClick: handleBookNewClick,
  };

  return (
    <>
      <Books linkedBook={linkedBook} {...handlers} />
      {dialog && (
        <BookPreviewDialog open={open} onClose={onClose} book={dialog}>
          {(props) => (
            <Book
              {...props}
              onBookLinkClick={handleBookLinkClick}
              onOtherBookLinkClick={onClose}
            />
          )}
        </BookPreviewDialog>
      )}
    </>
  );
}

export default Index;
