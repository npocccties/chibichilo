import { useRouter } from "next/router";
import type { ContentSchema } from "$server/models/content";
import type { BookSchema } from "$server/models/book";
import { useSessionAtom } from "$store/session";
import BooksTemplate from "$templates/Books";
import DeepLinkBooksTemplate from "$templates/DeepLinkBooks";
import Book from "$templates/Book";
import BookPreviewDialog from "$organisms/BookPreviewDialog";
import useBooks from "$utils/useBooks";
import useLinkedBook from "$utils/useLinkedBook";
import { pagesPath } from "$utils/$path";
import useDialogProps from "$utils/useDialogProps";
import useBookLinkingHandlers from "$utils/useBookLinkingHandlers";

const Books = (
  props: Omit<
    Parameters<typeof BooksTemplate>[0],
    keyof ReturnType<typeof useBooks>
  >
) => <BooksTemplate {...props} {...useBooks()} />;

const DeepLinkBooks = (
  props: Omit<
    Parameters<typeof DeepLinkBooksTemplate>[0],
    keyof ReturnType<typeof useBooks>
  >
) => <DeepLinkBooksTemplate {...props} {...useBooks()} />;

function Index() {
  const router = useRouter();
  const { session } = useSessionAtom();
  const { linkedBook } = useLinkedBook();
  const {
    data: previewContent,
    dispatch: onContentPreviewClick,
    ...dialogProps
  } = useDialogProps<ContentSchema>();
  const onContentEditClick = (book: Pick<ContentSchema, "id" | "authors">) => {
    return router.push(
      pagesPath.book.edit.$url({
        query: { context: "books", bookId: book.id },
      })
    );
  };
  const handleBookNewClick = () => {
    return router.push(
      pagesPath.book.new.$url({ query: { context: "books" } })
    );
  };
  const handleBooksImportClick = () => {
    return router.push(
      pagesPath.books.import.$url({ query: { context: "books" } })
    );
  };
  const { onBookLinking: onContentLinkClick } = useBookLinkingHandlers();
  const handleLinkedBookClick = (book: Pick<BookSchema, "id">) =>
    router.push(pagesPath.book.$url({ query: { bookId: book.id } }));
  const handlers = {
    onContentPreviewClick,
    onContentEditClick,
    onBookNewClick: handleBookNewClick,
    onBooksImportClick: handleBooksImportClick,
    onContentLinkClick,
    onLinkedBookClick: handleLinkedBookClick,
  };
  const isDeepLink = !!session?.ltiDlSettings?.deep_link_return_url;

  if (isDeepLink) {
    return (
      <>
        <DeepLinkBooks linkedBook={linkedBook} {...handlers} />
        {previewContent?.type === "book" && (
          <BookPreviewDialog {...dialogProps} book={previewContent}>
            {(props) => <Book {...props} />}
          </BookPreviewDialog>
        )}
      </>
    );
  }

  return (
    <>
      <Books linkedBook={linkedBook} {...handlers} />
      {previewContent?.type === "book" && (
        <BookPreviewDialog {...dialogProps} book={previewContent}>
          {(props) => <Book {...props} />}
        </BookPreviewDialog>
      )}
    </>
  );
}

export default Index;
