import { useRouter } from "next/router";
import type { TopicProps } from "$server/models/topic";
import type { VideoTrackProps } from "$server/models/videoTrack";
import TopicNew from "$templates/TopicNew";
import Placeholder from "$templates/Placeholder";
import Unknown from "$templates/Unknown";
import { useAddVideoTrackAtom } from "$store/topic";
import { updateBook, useBook } from "$utils/book";
import { createTopic } from "$utils/topic";
import type { Query as BookEditQuery } from "../edit";
import { uploadVideoTrack } from "$utils/videoTrack";
import { pagesPath } from "$utils/$path";

export type Query = BookEditQuery;

function New({ bookId, context }: Query) {
  const book = useBook(bookId);
  const router = useRouter();
  const [videoTracks, addVideoTrack] = useAddVideoTrackAtom();
  async function handleSubmit(props: TopicProps) {
    if (!book) return;

    const {
      id,
      resource: { id: resourceId },
    } = await createTopic(props);

    await Promise.all(
      videoTracks.map((vt) => uploadVideoTrack(resourceId, vt))
    );

    await updateBook({
      ...book,
      ltiResourceLinks: undefined,
      sections: [...book.sections, { name: null, topics: [{ id }] }],
    });

    const bookEditQuery = { bookId, ...(context && { context }) };
    await router.replace(
      pagesPath.book.topic.edit.$url({
        query: { ...bookEditQuery, topicId: id },
      })
    );
    return router.push(
      pagesPath.book.edit.$url({
        query: bookEditQuery,
      })
    );
  }
  function handleSubtitleSubmit(videoTrack: VideoTrackProps) {
    addVideoTrack(videoTrack);
    // FIXME: 追加された字幕が画面に反映されない不具合
  }
  async function handleSubtitleDelete() {
    // TODO: 未実装
  }

  if (!book) return <Placeholder />;

  return (
    <TopicNew
      onSubmit={handleSubmit}
      onSubtitleSubmit={handleSubtitleSubmit}
      onSubtitleDelete={handleSubtitleDelete}
    />
  );
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId))
    return (
      <Unknown header="ブックがありません">
        ブックが見つかりませんでした
      </Unknown>
    );

  return <New bookId={bookId} context={context} />;
}

export default Router;
