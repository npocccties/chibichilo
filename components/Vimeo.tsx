import React from "react";
import Player, { Options } from "@vimeo/player";
import { usePlayerTracking } from "./player";
import { volumePersister } from "./player/volume";

type VimeoProps = {
  options: Options;
  onEnded?: () => void;
};

const defaultOptions: Options = {
  responsive: true,
};

export function Vimeo(props: VimeoProps) {
  const ref = React.useRef(document.createElement("div"));
  const tracking = usePlayerTracking();
  React.useEffect(() => {
    const player = new Player(ref.current, {
      ...defaultOptions,
      ...props.options,
    });
    tracking(player);
    volumePersister(player);
    if (props.onEnded) player.on("ended", props.onEnded);
    return () => {
      player.destroy();
      // NOTE: destroy() してもゴミが残るので新しい空の要素にしておく
      ref.current.textContent = "";
    };
  }, [props.options, props.onEnded]);
  return <div ref={ref} />;
}
