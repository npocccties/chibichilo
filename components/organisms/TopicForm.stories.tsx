import TopicForm from "./TopicForm";
import { topic } from "samples";
import { useVideoTrackAtom } from "$store/videoTrack";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";

export default { title: "organisms/TopicForm" };

const handlers = {
  onSubmit: console.log,
};

const handleSubtitleSubmit = (
  handler: (videoTrack: VideoTrackSchema) => void
) => (videoTrackProps: VideoTrackProps) => {
  const { language, content } = videoTrackProps;
  handler({
    id: new Date().getTime(),
    kind: "subtitles",
    language,
    url: URL.createObjectURL(new Blob([content])),
  });
};

export const Default = () => {
  const { addVideoTrack, deleteVideoTrack } = useVideoTrackAtom();
  return (
    <TopicForm
      topic={topic}
      onSubtitleDelete={({ id }) => deleteVideoTrack(id)}
      onSubtitleSubmit={handleSubtitleSubmit(addVideoTrack)}
      {...handlers}
    />
  );
};
