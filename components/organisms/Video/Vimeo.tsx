import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { VimeoInstance } from "$types/videoInstance";

const playerSx: SxProps<Theme> = {
  "& > :first-child:empty": {
    // NOTE: @vimeo/player によって iframe がぶら下がる前の高さを確保する
    paddingTop: "56.25%",
  },
};

type Props = Omit<VimeoInstance, "type" | "url">;

function Vimeo({ element, player }: Props) {
  const ref = useRef(document.createElement("div"));
  useEffect(() => {
    const { current } = ref;
    current.appendChild(element);
    return () => {
      // TODO: 要素を取り除くと学習活動の記録のために使われている getPlayed() が resolve しないので残す
      //       メモリリークにつながるので避けたほうが望ましく、学習活動の送信後すみやかに取り除くべき
      void player.pause();
      current.removeChild(element);
    };
  }, [element, player]);
  return <Box ref={ref} sx={playerSx} />;
}

export default Vimeo;
