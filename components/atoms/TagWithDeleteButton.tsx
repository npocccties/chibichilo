import { css } from "@emotion/css";
import CloseIcon from "@mui/icons-material/Close";
import type { BookmarkProps, BookmarkSchema } from "$server/models/bookmark";
import Emoji from "./Emoji";

const tagClass = css({
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
});

const text = css({
  lineHeight: "1.1",
  fontSize: "12px",
  marginRight: "8px",
  whiteSpace: "nowrap",
});

const closeButton = css({
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
});

type Props = {
  topicId: BookmarkProps["topicId"];
  bookmark: BookmarkSchema;
  onDeleteBookmark: (id: number, topicId: number) => Promise<void>;
};

export default function TagWithDeleteButton({
  topicId,
  bookmark,
  onDeleteBookmark,
}: Props) {
  if (!bookmark?.tag) return null;

  return (
    <div className={tagClass}>
      <Emoji emoji={bookmark.tag.emoji} />
      <p className={text}>{bookmark.tag.label}</p>
      <button
        className={closeButton}
        onClick={async () => await onDeleteBookmark(bookmark.id, topicId)}
      >
        <CloseIcon titleAccess="削除" />
      </button>
    </div>
  );
}
