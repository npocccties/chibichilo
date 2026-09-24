import Box from "@mui/material/Box";
import twemoji from "@twemoji/api";

import type { TagSchema } from "$server/models/bookmark";

type Props = {
  emoji: TagSchema["emoji"];
};

export default function Emoji({ emoji }: Props) {
  return (
    <Box
      component="span"
      sx={{
        lineHeight: "1",
        "> .emoji": {
          width: "16px",
          height: "16px",
        },
      }}
      dangerouslySetInnerHTML={{
        __html: twemoji.parse(emoji),
      }}
    />
  );
}
