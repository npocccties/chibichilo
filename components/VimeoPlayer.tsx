import { memo } from "react";
import { Vimeo } from "./Vimeo";

type PlayerProps = {
  src: string;
  autoplay?: boolean;
  onEnded?: () => void;
};

function VimeoPlayerBase(props: PlayerProps) {
  return (
    <Vimeo
      options={{
        id: Number(props.src),
        autoplay: props.autoplay,
      }}
      onEnded={props.onEnded}
    />
  );
}

export const VimeoPlayer = memo(VimeoPlayerBase);
