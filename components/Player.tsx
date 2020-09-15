import { VideoLocation } from "./video/location";
import { Subtitle } from "./video/subtitle";
import { YouTubePlayer } from "./YouTubePlayer";
import { VimeoPlayer } from "./VimeoPlayer";
import { WowzaPlayer } from "./WowzaPlayer";

export type PlayerProps = VideoLocation & {
  subtitles: Subtitle[];
  autoplay?: boolean;
};

export function Player(props: PlayerProps) {
  switch (props.type) {
    case "youtube":
      return <YouTubePlayer {...props} />;
    case "vimeo":
      return <VimeoPlayer {...props} />;
    case "wowza":
    default:
      return <WowzaPlayer {...props} />;
  }
}
