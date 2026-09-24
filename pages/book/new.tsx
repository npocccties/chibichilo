import { useAppRouter } from "$utils/useAppRouter";
import BookNew from "$templates/BookNew";
import useBookNewHandlers from "$utils/useBookNewHandlers";
import { useTopics } from "$utils/topic";

export type Query = {
  context?: "books" | "topics";
  topics?: number | number[];
};

function New({ context, topics: topicIds }: Query) {
  const handlers = useBookNewHandlers(context);
  const topics = useTopics(getTopicsIdArray(topicIds));

  return <BookNew {...handlers} topics={topics} />;
}

function Router() {
  const router = useAppRouter();
  const { context, topics }: Pick<Query, "context" | "topics"> = router.query;

  return <New context={context} topics={topics} />;
}

function getTopicsIdArray(topics: Query["topics"]): undefined | number[] {
  if (topics == null) return undefined;
  if (Array.isArray(topics)) return topics.map((id) => Number(id));
  return [Number(topics)];
}

export default Router;
