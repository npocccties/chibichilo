import Emoji from "$atoms/Emoji";
import type { BookmarkSchema } from "$server/models/bookmark";
import { useBookmarksByTopicId } from "$utils/bookmark/useBookmarks";
import { css } from "@emotion/css";
import { Box } from "@mui/material";
import { useMemo } from "react";

type Props = {
  topicId: number;
};

const text = css({
  fontSize: "12px",
});

export default function TagCount({ topicId }: Props) {
  const { bookmarks } = useBookmarksByTopicId({ topicId, isAllUsers: true });

  const tagWithCounts = useMemo(() => {
    const tags = bookmarks.flatMap((bookmark) => bookmark.tag);

    const countItems = tags.reduce<
      Record<number, BookmarkSchema["tag"] & { count: number }>
    >((acc, item) => {
      if (!item) {
        return acc;
      }
      if (!acc[item.id]) {
        acc[item.id] = { ...item, count: 0 };
      }
      acc[item.id].count += 1;
      return acc;
    }, {});

    return Object.values(countItems);
  }, [bookmarks]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {tagWithCounts.map((tag) => (
        <Box
          key={tag.id}
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            marginRight: "4px",
            borderRadius: "999px",
            border: "solid 1px #D1D5DB",
            backgroundColor: "#FFF",
            height: "24px",
            padding: "8px 6px",
            margin: "4px",
            "> :first-child": {
              marginRight: "4px",
            },
          }}
        >
          <Emoji emoji={tag.emoji} />
          <p className={text}>{tag.count}</p>
        </Box>
      ))}
    </Box>
  );
}
