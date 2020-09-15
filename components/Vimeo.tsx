import React from "react";
import Player, { Options } from "@vimeo/player";

const defaultOptions: Options = {
  responsive: true,
};

export function Vimeo(props: { options: Options }) {
  const ref = React.useRef(document.createElement("div"));
  React.useEffect(() => {
    const player = new Player(ref.current, {
      ...defaultOptions,
      ...props.options,
    });
    return () => {
      player.destroy();
    };
  }, [props.options]);
  return <div ref={ref} />;
}
