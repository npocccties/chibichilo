import React from "react";
import { Box } from "@mui/material";

import { useRouter } from "next/router";
import { css } from "@emotion/css";

import type { BookmarkSchema } from "$server/models/bookmark";
import formatInterval from "$utils/formatInterval";
import DescriptionList from "$atoms/DescriptionList";
import getLocaleDateString from "$utils/getLocaleDateString";
import Tag from "$atoms/Tag";
import { useUpdateLtiContextAtom } from "$store/session";
import { handleBookmarkClick } from "$utils/bookmark/handleBookmarkClick";

const bookmarkButton = css({
  textAlign: "left",
  padding: "8px 32px",
  width: "100%",
  // reset button style
  background: "none",
  cursor: "pointer",
  border: "none",
  margin: 0,
});

const bookmarkTitle = css({
  margin: 0,
  fontSize: 16,
});

type Props = {
  bookmark: BookmarkSchema;
};

export default function BookmarkPreview({ bookmark }: Props) {
  const router = useRouter();
  const [, setLtiContext] = useUpdateLtiContextAtom();

  // 最新のタグ更新日時を取得
  const latestUpdatedAt = bookmark.topic.bookmarks
    ?.map((bookmark) => bookmark.updatedAt)
    .sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    })[0];

  const courseBookmark = bookmark.topic.bookmarks.filter(
    (item) =>
      item.ltiContext.consumerId === bookmark.ltiConsumerId &&
      item.ltiContext.id === bookmark.ltiContext.id
  );

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
    <button className={bookmarkButton} onClick={handleClick}>
      <h5 className={bookmarkTitle}>{bookmark.topic?.name}</h5>
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
        {courseBookmark.map((bookmark) => {
          if (bookmark.tag) {
            return <Tag key={bookmark.id} tag={bookmark.tag} />;
          }
          if (bookmark.memoContent) {
            return <Tag key={bookmark.id} memoContent={bookmark.memoContent} />;
          }

          return null;
        })}
      </Box>
    </button>
  );
}
