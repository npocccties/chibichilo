import React from "react";
import { Box } from "@mui/material";

import { pagesPath } from "$utils/$path";
import { useRouter } from "next/router";
import { css } from "@emotion/css";

import type { BookmarkSchema } from "$server/models/bookmark";
import formatInterval from "$utils/formatInterval";
import DescriptionList from "$atoms/DescriptionList";
import getLocaleDateString from "$utils/getLocaleDateString";
import Tag from "$atoms/Tag";
import { useSetAtom } from "jotai";
import { ltiConsumerIdAtom } from "$store/ltiConsumer";
import { ltiContextIdAtom } from "$store/ltiContext";

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
  const setLtiConsumerId = useSetAtom(ltiConsumerIdAtom);
  const setLtiContextId = useSetAtom(ltiContextIdAtom);

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
    setLtiConsumerId(bookmark.ltiConsumerId ?? null);
    setLtiContextId(bookmark.ltiContext.id);
    const url = pagesPath.book.$url({
      query: {
        bookId: bookmark.bookId,
        // TODO: topicId: bookmark.topicId,
      },
    });
    await router.push(url);
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
        {courseBookmark.map((bm) => {
          if (bm.bookId != null && bm.bookId === bookmark.bookId) {
            if (bm.tag) {
              return <Tag key={bm.id} tag={bm.tag} />;
            }
            if (bm.memoContent) {
              return <Tag key={bm.id} memoContent={bm.memoContent} />;
            }
          }

          return null;
        })}
      </Box>
    </button>
  );
}
