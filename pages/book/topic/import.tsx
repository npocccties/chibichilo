import { useRouter } from "next/router";
import TopicImport from "$templates/TopicImport.tsx";
import Placeholder from "$templates/Placeholder";
import Unknown from "$templates/Unknown";
import { updateBook, useBook } from "$utils/book";
import type {
  Query as BookEditQuery,
  EditProps as BookEditProps,
} from "../edit";
import { useTopics } from "$utils/topics";
import { TopicSchema } from "$server/models/topic";

function Import({ bookId, prev }: BookEditProps) {
  const book = useBook(bookId);
  const topics = useTopics();
  const router = useRouter();
  const bookEditQuery = { bookId, ...(prev && { prev }) };
  async function handleSubmit(ids: Array<TopicSchema["id"]>) {
    if (!book) return;

    await updateBook({
      ...book,
      ltiResourceLinks: undefined,
      sections: [...book.sections, ...ids.map((id) => ({ topics: [{ id }] }))],
    });

    return router.push({
      pathname: "/book/edit",
      query: bookEditQuery,
    });
  }
  function handleTopicEditClick({ id: topicId }: Pick<TopicSchema, "id">) {
    return router.push({
      pathname: "/book/topic/edit",
      query: { ...bookEditQuery, topicId },
    });
  }
  const handlers = {
    onSubmit: handleSubmit,
    onTopicEditClick: handleTopicEditClick,
  };

  if (!book) return <Placeholder />;
  if (!topics) return <Placeholder />;

  return <TopicImport topics={topics} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const query: BookEditQuery = router.query;
  const bookId = Number(query.bookId);

  if (!Number.isFinite(bookId))
    return (
      <Unknown header="ブックがありません">
        ブックが見つかりませんでした
      </Unknown>
    );

  return <Import bookId={bookId} prev={query.prev} />;
}

export default Router;
