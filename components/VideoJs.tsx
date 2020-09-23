import React from "react";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import ja from "video.js/dist/lang/ja.json";
import "videojs-youtube";
import "videojs-seek-buttons";
import { usePlayerTracking } from "./player";

type VideoJsProps = {
  options: VideoJsPlayerOptions;
  tracks?: videojs.TextTrackOptions[];
  onEnded?: () => void;
};

const defaultOptions: VideoJsPlayerOptions = {
  controls: true,
  fluid: true,
  controlBar: {
    // FIXME: https://github.com/videojs/videojs-youtube/issues/562
    // @ts-expect-error
    pictureInPictureToggle: false,
  },
  playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  language: "ja",
  languages: { ja },
};

export function VideoJs(props: VideoJsProps) {
  const ref = React.useRef(document.createElement("div"));
  const tracking = usePlayerTracking();
  React.useEffect(() => {
    const element = document.createElement("video-js");
    element.classList.add("vjs-big-play-centered");
    ref.current.appendChild(element);
    const player = videojs(element, { ...defaultOptions, ...props.options });
    // @ts-expect-error
    player.seekButtons({
      forward: 15,
      back: 15,
    });
    tracking(player);
    volumePersister(player);
    if (props.onEnded) player.on("ended", props.onEnded);
    return () => player.dispose();
  }, [props.options, props.onEnded]);
  const tracksRef = React.useRef<HTMLTrackElement[]>([]);
  React.useEffect(() => {
    if (!props.tracks || props.tracks.length === 0) return;
    const player: VideoJsPlayer | undefined = ref.current.querySelector(
      "video-js"
      // @ts-expect-error
    )?.player;
    if (!player) return;
    player.ready(() => {
      tracksRef.current.forEach((track) => {
        player.removeRemoteTextTrack(track);
      });
      tracksRef.current = (props.tracks
        ?.map((track) => track && player.addRemoteTextTrack(track, false))
        .filter(Boolean) ?? []) as HTMLTrackElement[];
    });
  }, [props.tracks]);
  return <div ref={ref} />;
}

function volumePersister(player: videojs.Player) {
  if (typeof window === "undefined") return;
  const key = "volumePersisterVolume";
  const muteKey = "volumePersisterMute";
  player.on("volumechange", function () {
    localStorage.setItem(key, player.volume().toString());
    if (player.muted()) {
      localStorage.setItem(muteKey, "true");
    } else {
      localStorage.removeItem(muteKey);
    }
  });
  const volume = localStorage.getItem(key);
  if (volume !== null) player.volume(Number(volume));
  player.muted(localStorage.getItem(muteKey) != null);
}
