import { useRouter } from "next/router";
import type { TopicProps, TopicSchema } from "$server/models/topic";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import type { Query as BookEditQuery } from "$pages/book/edit";
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
import { updateBook, useBook } from "$utils/book";

export type Query =
  | { topicId: TopicSchema["id"] }
  | ({ topicId: TopicSchema["id"] } & BookEditQuery);

type EditProps = {
  topicId: TopicSchema["id"];
  back(): Promise<unknown>;
  onDelete?(topic: TopicSchema): Promise<void>;
};

type EditWithBookProps = EditProps & BookEditQuery;

function Edit({ topicId, back, onDelete }: EditProps) {
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

function EditWithBook({ bookId, ...props }: EditWithBookProps) {
  const book = useBook(bookId);
  async function handleDelete({ id: topicId }: Pick<TopicSchema, "id">) {
    if (!book) return;
    await updateBook({
      ...book,
      ltiResourceLinks: undefined,
      sections: book?.sections?.map((section) => ({
        ...section,
        topics: section.topics.filter(({ id }) => id !== topicId),
      })),
    });
  }

  if (!book) return <Placeholder />;

  return <Edit {...props} onDelete={handleDelete} />;
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

  if (!Number.isFinite(topicId)) {
    return (
      <Unknown header="トピックがありません">
        トピックが見つかりませんでした
      </Unknown>
    );
  }
  if ("bookId" in bookEditQuery && !Number.isFinite(bookEditQuery.bookId)) {
    return (
      <Unknown header="ブックがありません">
        ブックが見つかりませんでした
      </Unknown>
    );
  }
  if ("bookId" in bookEditQuery) {
    return <EditWithBook topicId={topicId} back={back} {...bookEditQuery} />;
  }
  return <Edit topicId={topicId} back={back} />;
}

export default Router;
