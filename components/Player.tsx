import React from "react";
import ISO6391 from "iso-639-1";
import { VideoJs } from "./VideoJs";
import { Subtitle } from "./video/subtitle";
import { VideoJsPlayerOptions } from "video.js";

export type PlayerProps = {
  youtubeVideoId: string;
  subtitles: Subtitle[];
  autoplay?: boolean;
};

export function Player(props: PlayerProps) {
  const options = React.useMemo(
    () =>
      ({
        techOrder: ["youtube"],
        sources: [
          {
            type: "video/youtube",
            src: `watch?v=${props.youtubeVideoId}`,
          },
        ],
        controls: true,
        fluid: true,
        autoplay: props.autoplay,
        controlBar: {
          // FIXME: https://github.com/videojs/videojs-youtube/issues/562
          pictureInPictureToggle: false,
        },
        playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      } as VideoJsPlayerOptions),
    [props.youtubeVideoId, props.autoplay]
  );
  const tracks = React.useMemo(() => props.subtitles.map(track), [
    props.subtitles,
  ]);
  return <VideoJs options={options} tracks={tracks} />;
}

function track(
  subtitle: Subtitle
): { kind: "subtitles"; src: string; srclang: string; label: string } {
  let src;
  if (subtitle.file.size === 0)
    src = `${process.env.NEXT_PUBLIC_SUBTITLE_STORE_PATH}/${subtitle.file.name}`;
  else src = URL.createObjectURL(subtitle.file);
  return {
    kind: "subtitles",
    src,
    srclang: subtitle.lang,
    label: ISO6391.getNativeName(subtitle.lang),
  };
}
