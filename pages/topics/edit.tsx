import { useRouter } from "next/router";
import type { TopicProps, TopicSchema } from "$server/models/topic";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import type { Query as BookEditQuery } from "$pages/book/edit";
import Placeholder from "$templates/Placeholder";
import TopicEdit from "$templates/TopicEdit";
import TopicNotFoundProblem from "$organisms/BookNotFoundProblem";
import BookNotFoundProblem from "$organisms/TopicNotFoundProblem";
import { useVideoTrackAtom } from "$store/videoTrack";
import { destroyTopic, updateTopic, useTopic } from "$utils/topic";
import { destroyVideoTrack, uploadVideoTrack } from "$utils/videoTrack";

export type Query =
  | { topicId: TopicSchema["id"] }
  | ({ topicId: TopicSchema["id"] } & BookEditQuery);

type EditProps = {
  topicId: TopicSchema["id"];
  back(): Promise<unknown>;
};

function Edit({ topicId, back }: EditProps) {
  const topic = useTopic(topicId);
  const { addVideoTrack, deleteVideoTrack } = useVideoTrackAtom();
  async function handleSubmit(props: TopicProps) {
    await updateTopic({ id: topicId, ...props });
    return back();
  }
  async function handleDelete(topic: TopicSchema) {
    await destroyTopic(topic.id);
    return back();
  }
  async function handleSubtitleSubmit(videoTrack: VideoTrackProps) {
    if (!topic) return;
    const uploaded = await uploadVideoTrack(topic.resource.id, videoTrack);
    addVideoTrack(uploaded);
  }
  async function handleSubtitleDelete({ id }: VideoTrackSchema) {
    if (!topic) return;
    await destroyVideoTrack(topic.resource.id, id);
    deleteVideoTrack(id);
  }
  function handleCancel() {
    return back();
  }
  const handlers = {
    onSubmit: handleSubmit,
    onDelete: handleDelete,
    onCancel: handleCancel,
    onSubtitleSubmit: handleSubtitleSubmit,
    onSubtitleDelete: handleSubtitleDelete,
  };

  if (!topic) return <Placeholder />;

  return <TopicEdit topic={topic} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const topicId = Number(router.query.topicId);
  const bookId = router.query.bookId && Number(router.query.bookId);
  const { context }: Pick<BookEditQuery, "context"> = router.query;
  const bookEditQuery = {
    ...(bookId && { bookId }),
    ...(context && { context }),
  };
  const back = () => router.push({ pathname: "./", query: bookEditQuery });

  if (!Number.isFinite(topicId)) return <TopicNotFoundProblem />;
  if ("bookId" in bookEditQuery && !Number.isFinite(bookEditQuery.bookId)) {
    return <BookNotFoundProblem />;
  }
  return <Edit topicId={topicId} back={back} />;
}

export default Router;
