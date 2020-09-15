import { memo } from "react";
import { Vimeo } from "./Vimeo";

type PlayerProps = {
  src: string;
  autoplay?: boolean;
};

function VimeoPlayerBase(props: PlayerProps) {
  return (
    <Vimeo
      options={{
        id: Number(props.src),
        autoplay: props.autoplay,
      }}
    />
  );
}

export const VimeoPlayer = memo(VimeoPlayerBase);
