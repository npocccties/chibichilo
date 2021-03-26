export default {
  title: "templates/TopicNew",
  parameters: { layout: "fullscreen" },
};

import TopicNew from "./TopicNew";
import { useVideoTrackAtom } from "$store/videoTrack";
import { topic } from "$samples";

const handlers = {
  onSubmit: console.log,
  onCancel: () => console.log("back"),
};

export const Default = () => {
  const { addVideoTrack, deleteVideoTrack } = useVideoTrackAtom();
  return (
    <TopicNew
      onSubtitleDelete={({ id }) => deleteVideoTrack(id)}
      onSubtitleSubmit={addVideoTrack}
      {...handlers}
    />
  );
};

export const Fork = () => {
  const { addVideoTrack, deleteVideoTrack } = useVideoTrackAtom();
  return (
    <TopicNew
      topic={topic}
      onSubtitleDelete={({ id }) => deleteVideoTrack(id)}
      onSubtitleSubmit={addVideoTrack}
      {...handlers}
    />
  );
};
