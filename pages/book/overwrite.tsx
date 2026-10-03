import { useState } from "react";
import { useAppRouter } from "$utils/useAppRouter";
import type {
  BooksImportParams,
  BooksImportResult,
} from "$server/models/booksImportParams";
import ContentImport from "$templates/ContentImport";
import importBook from "$utils/importBook";
import BookNotFoundProblem from "$templates/BookNotFoundProblem";

export type Query = { bookId?: number };

function Import({ bookId }: Query) {
  const router = useAppRouter();
  const [importResult, setImportResult] = useState<BooksImportResult>();
  const back = () => {
    return router.back();
  };
  const handleSubmit = async (props: BooksImportParams) => {
    try {
      setImportResult(undefined);
      if (bookId) {
        setImportResult(await importBook(bookId, props));
      }
    } catch (e) {
      // @ts-expect-error TODO: Object is of type 'unknown'
      setImportResult(await e.json());
    }
  };
  const handleCancel = () => {
    return back();
  };
  const handlers = {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
  };

  return (
    <>
      <ContentImport
        title={"ブックの上書きインポート"}
        importResult={importResult}
        {...handlers}
      />
    </>
  );
}

function Router() {
  const router = useAppRouter();
  const bookId = Number(router.query.bookId);

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Import bookId={bookId} />;
}

export default Router;
