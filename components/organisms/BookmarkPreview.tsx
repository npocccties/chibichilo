import React from "react";
import Box from "@mui/material/Box";

import { useAppRouter } from "$utils/useAppRouter";

import type { BookmarkSchema } from "$server/models/bookmark";
import formatInterval from "$utils/formatInterval";
import DescriptionList from "$atoms/DescriptionList";
import getLocaleDateString from "$utils/getLocaleDateString";
import Tag from "$atoms/Tag";
import { useUpdateLtiContextAtom } from "$store/session";
import { handleBookmarkClick } from "$utils/bookmark/handleBookmarkClick";

const bookmarkButtonSx = {
  textAlign: "left",
  padding: "8px 32px",
  width: "100%",
  // reset button style
  background: "none",
  cursor: "pointer",
  border: "none",
  margin: 0,
};

const bookmarkTitleSx = {
  margin: 0,
  fontSize: 16,
};

type Props = {
  bookmark: BookmarkSchema;
};

export default function BookmarkPreview({ bookmark }: Props) {
  const router = useAppRouter();
  const [, setLtiContext] = useUpdateLtiContextAtom();

  const courseBookmark = bookmark.topic.bookmarks.filter(
    (item) =>
      item.ltiContext.consumerId === bookmark.ltiConsumerId &&
      item.ltiContext.id === bookmark.ltiContext.id &&
      item.bookId === bookmark.bookId
  );
  // 最新のタグ更新日時を取得
  const latestUpdatedAt = courseBookmark
    .map((item) => item.updatedAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await handleBookmarkClick(
      bookmark,
      setLtiContext,
      router.push,
      router.pathname
    );
  };

  return (
    <Box component="button" sx={bookmarkButtonSx} onClick={handleClick}>
      <Box component="h5" sx={bookmarkTitleSx}>
        {bookmark.topic?.name}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <DescriptionList
          sx={{ mr: 1 }}
          value={[
            {
              key: "学習時間",
              value: formatInterval(0, bookmark.topic.timeRequired * 1000),
            },
          ]}
        />
        <DescriptionList
          sx={{ mr: 1 }}
          value={[
            {
              key: "コース",
              value: bookmark.ltiContext?.title,
            },
          ]}
        />
        {bookmark.book && (
          <DescriptionList
            sx={{ mr: 1 }}
            value={[
              {
                key: "ブック",
                value: bookmark.book.name,
              },
            ]}
          />
        )}
        <DescriptionList
          sx={{ mr: 1 }}
          value={[
            {
              key: "タグ更新日時",
              value: getLocaleDateString(new Date(latestUpdatedAt), "ja"),
            },
          ]}
        />
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {courseBookmark.map((bm) => {
          if (bm.tag) {
            return <Tag key={bm.id} tag={bm.tag} />;
          }
          if (bm.memoContent) {
            return <Tag key={bm.id} memoContent={bm.memoContent} />;
          }
          return null;
        })}
      </Box>
    </Box>
  );
}
