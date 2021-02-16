export default { title: "templates/TopicNew" };

import TopicNew from "./TopicNew";
import { useVideoTrackAtom } from "$store/videoTrack";

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
