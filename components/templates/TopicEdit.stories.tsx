export default { title: "templates/TopicEdit" };

import TopicEdit from "./TopicEdit";
import { topic } from "samples";
import { useVideoTrackAtom } from "$store/videoTrack";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";

const handlers = {
  onSubmit: console.log,
  onDelete: console.log,
  onCancel: () => console.log("back"),
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
    <TopicEdit
      topic={topic}
      onSubtitleDelete={({ id }) => deleteVideoTrack(id)}
      onSubtitleSubmit={handleSubtitleSubmit(addVideoTrack)}
      {...handlers}
    />
  );
};

export const Empty = () => {
  const { addVideoTrack, deleteVideoTrack } = useVideoTrackAtom();
  return (
    <TopicEdit
      topic={null}
      onSubtitleDelete={({ id }) => deleteVideoTrack(id)}
      onSubtitleSubmit={handleSubtitleSubmit(addVideoTrack)}
      {...handlers}
    />
  );
};
