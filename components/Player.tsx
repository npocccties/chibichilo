import { Subtitle } from "./video/subtitle";
import { YouTubePlayer } from "./YouTubePlayer";

export type PlayerProps = {
  type: "youtube" | "wowza" | "vimeo";
  src: string;
  subtitles: Subtitle[];
  autoplay?: boolean;
};

/** TODO: Wowza, Vimeo未対応 */
export function Player(props: PlayerProps) {
  return <YouTubePlayer {...props} />;
}
