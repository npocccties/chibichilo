import { Video } from "./video";
import { VideoPlayer } from "./VideoPlayer";

export function ShowVideo(props: Video) {
  return <VideoPlayer {...props} />;
}
