import { useRouter } from "next/router";
import type { TopicProps, TopicSchema } from "$server/models/topic";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import Placeholder from "$templates/Placeholder";
import TopicEdit from "$templates/TopicEdit";
import Unknown from "$templates/Unknown";
import {
  destroyTopic,
  revalidateTopic,
  updateTopic,
  useTopic,
} from "$utils/topic";
import { destroyVideoTrack, uploadVideoTrack } from "$utils/videoTrack";

export type Query = { topicId?: string };

export type EditProps = {
  topicId: TopicSchema["id"];
  back(): Promise<unknown>;
  onDelete?(topic: TopicSchema): Promise<void>;
};

export function Edit({ topicId, back, onDelete }: EditProps) {
  const topic = useTopic(topicId);
  async function handleSubmit(props: TopicProps) {
    await updateTopic({ id: topicId, ...props });
    return back();
  }
  async function handleDelete(topic: TopicSchema) {
    // TODO: ブックから参照されているトピックは削除できないので何かしら処置が必要
    await onDelete?.(topic);
    await destroyTopic(topicId);
    return back();
  }
  async function handleSubtitleSubmit(videoTrack: VideoTrackProps) {
    if (!topic) return;
    await uploadVideoTrack(topic.resource.id, videoTrack);
    await revalidateTopic(topic.id);
  }
  async function handleSubtitleDelete({ id }: Pick<VideoTrackSchema, "id">) {
    if (!topic) return;
    await destroyVideoTrack(topic.resource.id, id);
    await revalidateTopic(topic.id);
  }
  const handlers = {
    onSubmit: handleSubmit,
    onDelete: handleDelete,
    onSubtitleSubmit: handleSubtitleSubmit,
    onSubtitleDelete: handleSubtitleDelete,
  };

  if (!topic) return <Placeholder />;

  return <TopicEdit topic={topic} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const query: Query = router.query;
  const props = { topicId: Number(query.topicId) };
  function backToTopics() {
    return router.push("/topics");
  }

  if (!Number.isFinite(props.topicId)) {
    return (
      <Unknown header="トピックがありません">
        トピックが見つかりませんでした
      </Unknown>
    );
  }

  return <Edit {...props} back={backToTopics} />;
}

export default Router;
