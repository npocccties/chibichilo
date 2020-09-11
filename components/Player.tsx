import { VideoLocation } from "./video/location";
import { Subtitle } from "./video/subtitle";
import { YouTubePlayer } from "./YouTubePlayer";
import { WowzaPlayer } from "./WowzaPlayer";

export type PlayerProps = VideoLocation & {
  subtitles: Subtitle[];
  autoplay?: boolean;
};

/** TODO: Vimeo未対応 */
export function Player(props: PlayerProps) {
  switch (props.type) {
    case "youtube":
      return <YouTubePlayer {...props} />;
    case "wowza":
    default:
      return <WowzaPlayer {...props} />;
  }
}
