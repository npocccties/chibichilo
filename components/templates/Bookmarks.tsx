import React, { useCallback, useState } from "react";
import { Box, Card, Container, Typography } from "@mui/material";
import { gray } from "$theme/colors";

import type { SessionSchema } from "$server/models/session";
import type { BookmarkTagMenu, TagSchema } from "$server/models/bookmark";
import { useFilterBookmarks } from "$utils/bookmark/useBookmarks";
import BookmarkPreview from "$organisms/BookmarkPreview";
import BookmarkMultiSelect from "$molecules/BookmarkMultiSelect";

import { NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK } from "$utils/env";

const titleSx = {
  fontSize: 32,
  mb: 4,
};

const cardSx = {
  border: `1px solid ${gray[300]}`,
  borderRadius: "12px",
  boxShadow: "none",
};

const headerSx = {
  padding: "8px 16px 8px 16px",
  borderBottom: `1px solid ${gray[300]}`,
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const bodySx = {
  backgroundColor: "#FFF",
};

const bookmarkWrapSx = {
  margin: "8px 0",
  padding: 0,
};

const bookmarkListSx = {
  listStyle: "none",
  borderBottom: `1px solid ${gray[300]}`,
};

const emptySx = {
  padding: "16px",
  textAlign: "center",
};

type Props = {
  session: SessionSchema;
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

  return NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK ? (
    <Container sx={{ mt: 5, gridArea: "title" }} maxWidth="md">
      <Typography variant="h4" sx={titleSx}>
        タグ管理
      </Typography>
      <Card sx={cardSx}>
        <Box sx={headerSx}>
          <BookmarkMultiSelect
            tags={bookmarkTagMenu}
            selectedTagIds={selectedTagIds}
            isExistMemoContent={isExistMemoContent}
            onTagSelect={onClickTagMenu}
            onClickMemoContent={onClickMemoContent}
          />
        </Box>
        <Box sx={bodySx}>
          {!data.bookmarks.length ? (
            <Box component="div" sx={emptySx}>
              <p>ブックマークが存在しません</p>
            </Box>
          ) : (
            <Box component="ul" sx={bookmarkWrapSx}>
              {data.bookmarks
                .filter(
                  (element, index, self) =>
                    self.findIndex(
                      (e) =>
                        e.topicId === element.topicId &&
                        e.bookId === element.bookId &&
                        e.ltiConsumerId === element.ltiConsumerId &&
                        e.ltiContext.id === element.ltiContext.id
                    ) === index
                )
                .map((bookmark) => {
                  return (
                    <Box component="li" key={bookmark.id} sx={bookmarkListSx}>
                      <BookmarkPreview bookmark={bookmark} />
                    </Box>
                  );
                })}
            </Box>
          )}
        </Box>
      </Card>
    </Container>
  ) : (
    <Container sx={{ mt: 5, gridArea: "title" }} maxWidth="md">
      <Typography variant="h4" sx={titleSx}>
        この機能は無効です。
      </Typography>
    </Container>
  );
}
