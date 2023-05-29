import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { TopicSubmitValues } from "$types/topicSubmitValues";
import type { TopicSchema } from "$server/models/topic";
import type { ResourceProps } from "$server/models/resource";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import type { Query as BookEditQuery } from "$pages/book/edit";
import Placeholder from "$templates/Placeholder";
import TopicEdit from "$templates/TopicEdit";
import TopicNotFoundProblem from "$templates/TopicNotFoundProblem";
import BookNotFoundProblem from "$templates/BookNotFoundProblem";
import { useVideoTrackAtom } from "$store/videoTrack";
import { destroyTopic, updateTopic, useTopic } from "$utils/topic";
import { destroyVideoTrack, uploadVideoTrack } from "$utils/videoTrack";
import useAuthorsHandler from "$utils/useAuthorsHandler";
import { useWowzaUpload } from "$utils/wowza/useWowzaUplooad";

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
  const { handleAuthorsUpdate, handleAuthorSubmit } = useAuthorsHandler(
    topic && { type: "topic", ...topic }
  );
  const [submitResult, setSubmitResult] = useState("");
  const { data: uploadResult, uploadFile } = useWowzaUpload();
  useEffect(() => {
    if (uploadResult instanceof Error) setSubmitResult(uploadResult.message);
  }, [uploadResult, setSubmitResult]);
  async function handleSubmit({ file, ...props }: TopicSubmitValues) {
    let resource: ResourceProps | null = null;
    if (file) {
      const res = await uploadFile(file);
      if (!res) return;
      if (res instanceof Error) return;
      resource = { url: res.url };
    }
    try {
      await updateTopic({
        id: topicId,
        ...props,
        resource: resource ?? props.resource,
      });
      return back();
    } catch (e) {
      const response = e as Response;
      const status = response.status;
      const statusText = response.statusText;
      try {
        setSubmitResult((await response.json()).message);
      } catch (e) {
        setSubmitResult(`${status} ${statusText}`);
      }
    }
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
    onAuthorsUpdate: handleAuthorsUpdate,
    onAuthorSubmit: handleAuthorSubmit,
  };

  if (!topic) return <Placeholder />;

  return <TopicEdit topic={topic} submitResult={submitResult} {...handlers} />;
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
