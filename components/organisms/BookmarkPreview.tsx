import React from "react";
import { Box } from "@mui/material";

import { css } from "@emotion/css";

import type { BookmarkSchema } from "$server/models/bookmark";
import formatInterval from "$utils/formatInterval";
import DescriptionList from "$atoms/DescriptionList";
import getLocaleDateString from "$utils/getLocaleDateString";
import Tag from "$atoms/Tag";
import { useTopic } from "$utils/topic";
import type { TopicSchema } from "$server/models/topic";

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
  onBookmarkPreviewClick(content: TopicSchema): void;
};

export default function BookmarkPreview({
  bookmark,
  onBookmarkPreviewClick,
}: Props) {
  const topic = useTopic(bookmark.topic.id);
  // 最新のタグ更新日時を取得
  const latestUpdatedAt = bookmark.topic.bookmarks
    ?.map((bookmark) => bookmark.updatedAt)
    .sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    })[0];
  const handle = (handler: (content: TopicSchema) => void) => () => {
    if (!topic) return;
    handler(topic);
  };

  const courseBookmark = bookmark.topic.bookmarks.filter(
    (item) => item.ltiContext.id === bookmark.ltiContext.id
  );

  return (
    <button className={bookmarkButton} onClick={handle(onBookmarkPreviewClick)}>
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
