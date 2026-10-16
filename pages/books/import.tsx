import { useState } from "react";
import { useAppRouter } from "$utils/useAppRouter";
import type { ContentSchema } from "$server/models/content";
import type {
  BooksImportParams,
  BooksImportResult,
} from "$server/models/booksImportParams";
import BooksImport from "$templates/BooksImport";
import Book from "$templates/Book";
import BookPreviewDialog from "$organisms/BookPreviewDialog";
import importBooks from "$utils/importBooks";
import { contextUrl, paths } from "$utils/routes";
import useAuthorsHandler from "$utils/useAuthorsHandler";
import useDialogProps from "$utils/useDialogProps";

export type Query = { context?: "books" };

function Import({ context }: Query) {
  const router = useAppRouter();
  const { handleAuthorSubmit } = useAuthorsHandler();
  const [importResult, setImportResult] = useState<BooksImportResult>({});
  const {
    data: previewContent,
    open,
    onClose,
    dispatch: onContentPreviewClick,
  } = useDialogProps<ContentSchema>();
  const back = () => {
    switch (context) {
      case "books":
        return router.push(contextUrl(context));
      default:
        return router.push(paths.books);
    }
  };
  const handleSubmit = async (props: BooksImportParams) => {
    try {
      setImportResult(await importBooks(props));
    } catch (e) {
      // @ts-expect-error TODO: Object is of type 'unknown'
      setImportResult(await e.json());
    }
  };
  const handleCancel = () => {
    return back();
  };
  const handlers = {
    onContentPreviewClick,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onAuthorSubmit: handleAuthorSubmit,
  };

  return (
    <>
      <BooksImport importResult={importResult} {...handlers} />
      {previewContent?.type === "book" && (
        <BookPreviewDialog open={open} onClose={onClose} book={previewContent}>
          {(props) => <Book {...props} />}
        </BookPreviewDialog>
      )}
    </>
  );
}

function Router() {
  const router = useAppRouter();
  const { context }: Pick<Query, "context"> = router.query;
  return <Import context={context} />;
}

export default Router;
