import React from "react";
import videojs, { VideoJsPlayer } from "video.js";
import "videojs-youtube";
import "videojs-seek-buttons";
import { useAppState, useAppPlayer } from "./state";

export function VideoJs(props: {
  options: videojs.PlayerOptions;
  tracks?: videojs.TextTrackOptions[];
}) {
  const ref = React.useRef(document.createElement("div"));
  const setPlayer = useAppPlayer();
  React.useEffect(() => {
    const element = document.createElement("video-js");
    element.classList.add("vjs-big-play-centered");
    ref.current.appendChild(element);
    const player = videojs(element, props.options);
    // @ts-ignore
    player.seekButtons({
      forward: 15,
      back: 15,
    });
    volumePersister(player);
    setPlayer(player);
    return () => {
      setPlayer(undefined);
      player.dispose();
    };
  }, [props.options]);
  const tracksRef = React.useRef<HTMLTrackElement[]>([]);
  React.useEffect(() => {
    if (!props.tracks || props.tracks.length === 0) return;
    const player: VideoJsPlayer | undefined = ref.current.querySelector(
      "video-js"
      // @ts-ignore
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

export function usePlayer(): videojs.Player | undefined {
  const player = useAppState().player;
  return player;
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
