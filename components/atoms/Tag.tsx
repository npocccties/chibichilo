import Box from "@mui/material/Box";
import type { BookmarkSchema, TagSchema } from "$server/models/bookmark";
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

type Props = {
  tag?: TagSchema;
  memoContent?: BookmarkSchema["memoContent"];
};

export default function Tag({ tag, memoContent }: Props) {
  if (!tag && !memoContent) return null;

  return (
    <Box sx={tagSx}>
      <Emoji emoji={tag?.emoji || "💬"} />
      <Box component="p" sx={textSx}>
        {tag?.label ||
          (memoContent && memoContent?.length > 5
            ? memoContent?.substring(0, 5) + "..."
            : memoContent)}
      </Box>
    </Box>
  );
}
