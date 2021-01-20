import { useRouter } from "next/router";
import TopicImport from "$templates/TopicImport.tsx";
import Placeholder from "$templates/Placeholder";
import Unknown from "$templates/Unknown";
import { updateBook, useBook } from "$utils/book";
import { useSession } from "$utils/session";
import { useTopics } from "$utils/topics";
import type { TopicSchema } from "$server/models/topic";
import type {
  Query as BookEditQuery,
  EditProps as BookEditProps,
} from "../edit";
import topicCreateBy from "$utils/topicCreateBy";
import { createTopic } from "$utils/topic";

function Import({ bookId, prev }: BookEditProps) {
  const { data: session } = useSession();
  const book = useBook(bookId);
  const topics = useTopics();
  const router = useRouter();
  const bookEditQuery = { bookId, ...(prev && { prev }) };
  async function handleSubmit(topics: TopicSchema[]) {
    if (!book) return;

    const connectOrCreateTopics = topics.map((topic) => {
      if (!session?.user) return Promise.reject();
      if (topicCreateBy(topic, session.user)) return Promise.resolve(topic.id);
      // NOTE: 自身以外の作成したトピックに関しては影響を及ぼすのを避ける目的で複製
      return createTopic(topic).then(({ id }) => id);
    });
    const ids = await Promise.all(connectOrCreateTopics);
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
