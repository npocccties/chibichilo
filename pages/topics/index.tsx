import type { TopicSchema } from "$server/models/topic";
import { useRouter } from "next/router";
import Topics from "$templates/Topics";
import { pagesPath } from "$utils/$path";
import useTopics from "$utils/useTopics";

const UserTopics = (
  props: Omit<Parameters<typeof Topics>[0], keyof ReturnType<typeof useTopics>>
) => <Topics {...props} {...useTopics()} />;

function Index() {
  const router = useRouter();
  function handleTopicEditClick({ id }: Pick<TopicSchema, "id">) {
    return router.push(pagesPath.topics.edit.$url({ query: { topicId: id } }));
  }
  function handleTopicNewClick() {
    return router.push(pagesPath.topics.new.$url({ query: {} }));
  }
  const handlers = {
    onTopicEditClick: handleTopicEditClick,
    onTopicNewClick: handleTopicNewClick,
  };

  return <UserTopics {...handlers} />;
}

export default Index;
