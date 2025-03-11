import React, { useCallback, useState } from "react";
import { Box, Card, Container, Typography } from "@mui/material";
import { css } from "@emotion/css";
import { gray } from "$theme/colors";

import type { BookmarkTagMenu, TagSchema } from "$server/models/bookmark";
import { useFilterBookmarks } from "$utils/bookmark/useBookmarks";
import useDialogProps from "$utils/useDialogProps";
import TopicPreviewDialog from "$organisms/TopicPreviewDialog";
import BookmarkPreview from "$organisms/BookmarkPreview";
import type { TopicSchema } from "$server/models/topic";
import BookmarkMultiSelect from "$molecules/BookmarkMultiSelect";

import { NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK } from "$utils/env";

const title = css({
  fontSize: 32,
  marginBottom: 32,
});

const card = css({
  border: `1px solid ${gray[300]}`,
  borderRadius: 12,
  boxShadow: "none",
});

const header = css({
  padding: "8px 16px 8px 16px",
  borderBottom: `1px solid ${gray[300]}`,
  display: "flex",
  alignItems: "center",
  gap: 16,
});

const body = css({
  backgroundColor: "#FFF",
});

const bookmarkWrap = css({
  margin: "8px 0",
  padding: 0,
});

const bookmarkList = css({
  listStyle: "none",
  borderBottom: `1px solid ${gray[300]}`,
});

const empty = css({
  padding: "16px",
  textAlign: "center",
});

type Props = {
  bookmarkTagMenu: BookmarkTagMenu;
};

type TagId = TagSchema["id"];
type TagIdList = Array<TagId>;

function isSelectedTagMenu(targetTagIds: TagIdList, selectedTagIds: TagIdList) {
  return targetTagIds.every((id) => selectedTagIds.includes(id));
}

export default function Bookmarks({ bookmarkTagMenu }: Props) {
  const [selectedTagIds, setSelectedTagIds] = useState<TagIdList>(
    bookmarkTagMenu.map((t) => t.id)
  );
  const [isExistMemoContent, setIsBookmarkMemoContent] = useState(true);

  const onClickTagMenu = useCallback(
    (tagIds: TagIdList) => {
      if (isSelectedTagMenu(tagIds, selectedTagIds)) {
        setSelectedTagIds((prev) => prev.filter((id) => tagIds.includes(id)));
      } else {
        setSelectedTagIds(tagIds);
      }
    },
    [selectedTagIds]
  );

  const onClickMemoContent = useCallback((bool: boolean) => {
    setIsBookmarkMemoContent(bool);
  }, []);

  const data = useFilterBookmarks({
    tagIds: String(
      new URLSearchParams(selectedTagIds.map((id) => ["tagIds", id.toString()]))
    ),
    isExistMemoContent,
  });

  const {
    data: previewContent,
    dispatch: handlePreviewClick,
    ...dialogProps
  } = useDialogProps<TopicSchema>();

  return NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK ? (
    <Container sx={{ mt: 5, gridArea: "title" }} maxWidth="md">
      <Typography variant="h4" className={title}>
        タグ管理
      </Typography>
      <Card className={card}>
        <Box className={header}>
          <BookmarkMultiSelect
            tags={bookmarkTagMenu}
            selectedTagIds={selectedTagIds}
            isExistMemoContent={isExistMemoContent}
            onTagSelect={onClickTagMenu}
            onClickMemoContent={onClickMemoContent}
          />
        </Box>
        <Box className={body}>
          {!data.bookmarks.length ? (
            <div className={empty}>
              <p>ブックマークが存在しません</p>
            </div>
          ) : (
            <ul className={bookmarkWrap}>
              {data.bookmarks.map((bookmark) => {
                return (
                  <li key={bookmark.id} className={bookmarkList}>
                    <BookmarkPreview
                      bookmark={bookmark}
                      onBookmarkPreviewClick={handlePreviewClick}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Box>
      </Card>
      {previewContent?.id && (
        <TopicPreviewDialog
          {...dialogProps}
          topic={previewContent}
          isPrivateBook={true}
        />
      )}
    </Container>
  ) : (
    <Container sx={{ mt: 5, gridArea: "title" }} maxWidth="md">
      <Typography variant="h4" className={title}>
        この機能は無効です。
      </Typography>
    </Container>
  );
}
