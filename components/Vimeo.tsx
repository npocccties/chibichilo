import React from "react";
import Player, { Options } from "@vimeo/player";

type VimeoProps = {
  options: Options;
  onEnded?: () => void;
};

const defaultOptions: Options = {
  responsive: true,
};

export function Vimeo(props: VimeoProps) {
  const ref = React.useRef(document.createElement("div"));
  React.useEffect(() => {
    const player = new Player(ref.current, {
      ...defaultOptions,
      ...props.options,
    });
    if (props.onEnded) player.on("ended", props.onEnded);
    return () => {
      player.destroy();
    };
  }, [props.options, props.onEnded]);
  return <div ref={ref} />;
}
