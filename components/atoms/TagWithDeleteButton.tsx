import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";
import type { BookmarkProps, BookmarkSchema } from "$server/models/bookmark";
import Emoji from "./Emoji";

const tagSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "26px",
  width: "fit-content",
  boxSizing: "border-box",
  borderRadius: "999px",
  margin: "6px 8px 6px 0px",
  padding: "4px 16px",
  background: "#FFF",
  border: "solid 1px #F3F4F6",
  "> :first-child": {
    marginRight: "8px",
  },
};

const textSx = {
  lineHeight: "1.1",
  fontSize: "12px",
  marginRight: "8px",
  whiteSpace: "nowrap",
};

const closeButtonSx = {
  // buttonのデフォルトスタイルを無効化
  border: "none",
  background: "none",
  padding: "0",
  cursor: "pointer",
  outline: "none",
  color: "#9CA3AF",

  lineHeight: "0.7",

  "> svg": {
    fontSize: "16px",
  },
};

type Props = {
  topicId: BookmarkProps["topicId"];
  bookId: BookmarkProps["bookId"];
  bookmark: BookmarkSchema;
  onDeleteBookmark: (
    id: number,
    topicId: number,
    bookId: number
  ) => Promise<void>;
};

export default function TagWithDeleteButton({
  topicId,
  bookId,
  bookmark,
  onDeleteBookmark,
}: Props) {
  if (!bookmark?.tag) return null;

  return (
    <Box sx={tagSx}>
      <Emoji emoji={bookmark.tag.emoji} />
      <Box component="p" sx={textSx}>
        {bookmark.tag.label}
      </Box>
      <Box
        component="button"
        sx={closeButtonSx}
        onClick={async () =>
          await onDeleteBookmark(bookmark.id, topicId, bookId)
        }
      >
        <CloseIcon titleAccess="削除" />
      </Box>
    </Box>
  );
}
