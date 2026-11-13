import type { TopicSchema } from "$server/models/topic";
import { useAppRouter } from "$utils/useAppRouter";
import TopicsTemplate from "$templates/Topics";
import { useSessionAtom } from "$store/session";
import { bookNewUrl, paths, topicsEditUrl } from "$utils/routes";
import useTopics from "$utils/useTopics";
import { destroyTopic, updateTopic } from "$utils/topic";
import { useSearchAtom } from "$store/search";
import { revalidateContents } from "$utils/useContents";
import { getReleaseFromRelatedBooks } from "$utils/release";

const Topics = (
  props: Omit<
    Parameters<typeof TopicsTemplate>[0],
    keyof ReturnType<typeof useTopics>
  >
) => <TopicsTemplate {...props} {...useTopics()} />;

function Index() {
  const router = useAppRouter();
  const { isContentEditable } = useSessionAtom();
  const { query } = useSearchAtom();
  async function handleBookNewClick(topics: TopicSchema[]) {
    const ids = topics.map(({ id }) => id);
    if (!ids || !ids.length) return;

    return router.push(bookNewUrl({ context: "topics", topics: ids }));
  }
  async function handleTopicsShareClick(
    topics: TopicSchema[],
    shared: boolean
  ) {
    for (const topic of topics) {
      if (isContentEditable(topic) && topic.shared != shared) {
        topic.shared = shared;
        await updateTopic(topic);
      }
    }
    await revalidateContents(query);
  }
  async function handleTopicsDeleteClick(topics: TopicSchema[]) {
    for (const topic of topics) {
      if (
        isContentEditable(topic) &&
        !getReleaseFromRelatedBooks(topic.relatedBooks)
      ) {
        await destroyTopic(topic.id);
      }
    }
    await revalidateContents(query);
  }
  function onContentEditClick(topic: Pick<TopicSchema, "id" | "authors">) {
    return router.push(topicsEditUrl({ topicId: topic.id }));
  }
  function handleTopicNewClick() {
    return router.push(paths.topicsNew);
  }
  const handlers = {
    onBookNewClick: handleBookNewClick,
    onTopicsShareClick: handleTopicsShareClick,
    onTopicsDeleteClick: handleTopicsDeleteClick,
    onContentEditClick,
    onTopicNewClick: handleTopicNewClick,
  };

  return <Topics {...handlers} />;
}

export default Index;
