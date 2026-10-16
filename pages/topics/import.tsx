import { useState } from "react";
import { useAppRouter } from "$utils/useAppRouter";
import type {
  BooksImportParams,
  BooksImportResult,
} from "$server/models/booksImportParams";
import ContentImport from "$templates/ContentImport";
import importTopic from "$utils/importTopic";
import TopicNotFoundProblem from "$templates/TopicNotFoundProblem";

export type Query = { topicId?: number };

function Import({ topicId }: Query) {
  const router = useAppRouter();
  const [importResult, setImportResult] = useState<BooksImportResult>();
  const back = () => {
    return router.back();
  };
  const handleSubmit = async (props: BooksImportParams) => {
    try {
      setImportResult(undefined);
      if (topicId) {
        setImportResult(await importTopic(topicId, props));
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
        title={"トピックの上書きインポート"}
        importResult={importResult}
        {...handlers}
      />
    </>
  );
}

function Router() {
  const router = useAppRouter();
  const topicId = Number(router.query.topicId);

  if (!Number.isFinite(topicId)) return <TopicNotFoundProblem />;

  return <Import topicId={topicId} />;
}

export default Router;
