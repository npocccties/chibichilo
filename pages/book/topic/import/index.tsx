import { useRouter } from "next/router";
import TopicImport from "$templates/TopicImport";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$organisms/TopicNotFoundProblem";
import { useSessionAtom } from "$store/session";
import { updateBook, useBook } from "$utils/book";
import { useTopics } from "$utils/topics";
import type { TopicSchema } from "$server/models/topic";
import type { Query as BookEditQuery } from "$pages/book/edit";
import { connectOrCreateTopic } from "$utils/topic";
import { pagesPath } from "$utils/$path";

export type Query = BookEditQuery;

function Import({ bookId, context }: BookEditQuery) {
  const { isBookEditable, isTopicEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isBookEditable, isTopicEditable);
  const topicsProps = useTopics();
  const router = useRouter();
  const bookEditQuery = { bookId, ...(context && { context }) };
  function back() {
    // TODO: トピックインポート画面で自身以外のブックへの経路を提供しないならば不要なので取り除きましょう
    const action = book && isBookEditable(book) ? "edit" : "generate";
    return router.push(
      pagesPath.book[action].$url({
        query: bookEditQuery,
      })
    );
  }
  async function handleSubmit(topics: TopicSchema[]) {
    if (!book) return;

    const connectOrCreateTopics = topics.map(async (topic) => {
      return connectOrCreateTopic(topic, isTopicEditable).then(({ id }) => id);
    });
    const ids = await Promise.all(connectOrCreateTopics);
    await updateBook({
      ...book,
      sections: [...book.sections, ...ids.map((id) => ({ topics: [{ id }] }))],
    });

    return back();
  }
  function handleCancel() {
    return back();
  }
  function handleTopicEditClick(topic: Pick<TopicSchema, "id">) {
    return router.push(
      pagesPath.book.topic.import.edit.$url({
        query: { ...bookEditQuery, topicId: topic.id },
      })
    );
  }
  const handlers = {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onTopicEditClick: handleTopicEditClick,
    isTopicEditable,
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
