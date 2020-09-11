import { memo } from "react";
import { VideoJs } from "./VideoJs";
import { Subtitle, buildTracks } from "./video/subtitle";

type PlayerProps = {
  src: string;
  subtitles: Subtitle[];
  autoplay?: boolean;
};

function YouTubePlayerBase(props: PlayerProps) {
  return (
    <VideoJs
      options={{
        techOrder: ["youtube"],
        sources: [
          {
            type: "video/youtube",
            src: `watch?v=${props.src}`,
          },
        ],
        autoplay: props.autoplay,
      }}
      tracks={buildTracks(props.subtitles)}
    />
  );
}

export const YouTubePlayer = memo(YouTubePlayerBase);
