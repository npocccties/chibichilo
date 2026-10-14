import { css } from "@emotion/css";
import twemoji from "@twemoji/api";

import type { TagSchema } from "$server/models/bookmark";

const emojiClass = css({
  lineHeight: "1",
  "> .emoji": {
    width: "16px",
    height: "16px",
  },
});

type Props = {
  emoji: TagSchema["emoji"];
};

export default function Emoji({ emoji }: Props) {
  return (
    <span
      className={emojiClass}
      dangerouslySetInnerHTML={{
        __html: twemoji.parse(emoji),
      }}
    />
  );
}
