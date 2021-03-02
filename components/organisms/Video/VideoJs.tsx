import { useEffect, useRef } from "react";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import ja from "video.js/dist/lang/ja.json";
import "videojs-youtube";
import "videojs-seek-buttons";
import { usePlayerTrackingAtom } from "$store/playerTracker";
import volumePersister from "$utils/volumePersister";

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
    pictureInPictureToggle: false,
  },
  playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  language: "ja",
  languages: { ja },
};

export function VideoJs(props: VideoJsProps) {
  const ref = useRef(document.createElement("div"));
  const tracking = usePlayerTrackingAtom();
  useEffect(() => {
    const { current } = ref;
    const element = document.createElement("video-js");
    element.classList.add("vjs-big-play-centered");
    current.appendChild(element);
    const player = videojs(element, { ...defaultOptions, ...props.options });
    // @ts-expect-error: @types/video.js@^7.3.11 Unsupported
    player.seekButtons({
      forward: 15,
      back: 15,
    });
    player.ready(() => {
      tracking(player);
      volumePersister(player);
      if (props.onEnded) player.on("ended", props.onEnded);
    });
    return () => {
      // TODO: played() に失敗するので dispose() せず一時停止して保持
      //       メモリリークにつながるので避けたほうが望ましい
      player.pause();
      current.textContent = "";
    };
  }, [props.options, props.onEnded, tracking]);
  const tracksRef = useRef<HTMLTrackElement[]>([]);
  useEffect(() => {
    if (!props.tracks || props.tracks.length === 0) return;
    const player: VideoJsPlayer | undefined = ref.current.querySelector(
      "video-js"
      // @ts-expect-error: @types/video.js@^7.3.11 Unsupported
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
