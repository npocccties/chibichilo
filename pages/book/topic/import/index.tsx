import { useRouter } from "next/router";
import TopicImport from "$templates/TopicImport";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$templates/BookNotFoundProblem";
import { useSessionAtom } from "$store/session";
import { updateBook, useBook } from "$utils/book";
import useTopics from "$utils/useTopics";
import type { TopicSchema } from "$server/models/topic";
import type { Query as BookEditQuery } from "$pages/book/edit";
import { pagesPath } from "$utils/$path";

export type Query = BookEditQuery;

function Import({ bookId, context }: BookEditQuery) {
  const { isContentEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isContentEditable);
  const topicsProps = useTopics();
  const router = useRouter();
  const bookEditQuery = { bookId, ...(context && { context }) };
  function back() {
    return router.push(pagesPath.book.edit.$url({ query: bookEditQuery }));
  }
  async function handleSubmit(topics: TopicSchema[]) {
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
  function onContentEditClick(topic: Pick<TopicSchema, "id" | "authors">) {
    const action = isContentEditable(topic) ? "edit" : "generate";
    return router.push(
      pagesPath.book.topic.import[action].$url({
        query: { ...bookEditQuery, topicId: topic.id },
      })
    );
  }
  const handlers = {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onContentEditClick,
    isContentEditable,
  };

  if (error) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  return <TopicImport {...topicsProps} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Import bookId={bookId} context={context} />;
}

export default Router;
