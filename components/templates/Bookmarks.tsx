import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { Box, Card, Container, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import { css } from "@emotion/css";
import gray from "theme/colors/gray";
import type { BookmarkTagMenu, TagSchema } from "$server/models/bookmark";
import { useBookmarksByTagId } from "$utils/bookmark/useBookmarks";

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

const listWrap = css({
  margin: 0,
  padding: 0,
  display: "flex",
  gap: 8,
});

const body = css({
  padding: "16px",
  backgroundColor: gray[50],
});

const list = css({
  listStyle: "none",
});

const button = css({
  display: "inline-block",
  background: "none",
  cursor: "pointer",
  border: "1px solid #339DFF",
  color: "#339DFF",
  borderRadius: 4,
  padding: "8px 16px",
  height: "36px",
});

const disabledButton = css({
  background: "#F7F7F7",
  color: "#6B6B6B",
  border: "1px solid #E6E6E6",
});

const checkIcon = css({
  fontSize: "12px",
  marginRight: 8,
  lineHeight: 1.1,
});

type Props = {
  bookmarkTagMenu: BookmarkTagMenu;
};

function isSelectedTagMenu(
  targetTagId: TagSchema["id"],
  selectedTagMenu: BookmarkTagMenu
) {
  return selectedTagMenu.some((tag) => tag.id === targetTagId);
}

export default function Bookmarks({ bookmarkTagMenu }: Props) {
  const [selectedTagMenu, setSelectedTagMenu] =
    useState<BookmarkTagMenu>(bookmarkTagMenu);
  const onClickTagMenu = useCallback(
    (tag: TagSchema) => {
      if (isSelectedTagMenu(tag.id, selectedTagMenu)) {
        setSelectedTagMenu((prev) =>
          prev.filter((selectedTag) => selectedTag.id !== tag.id)
        );
      } else {
        setSelectedTagMenu((prev) => [...prev, tag]);
      }
    },
    [selectedTagMenu]
  );

  const data = useBookmarksByTagId({
    tagIds: (selectedTagMenu.length > 0 ? selectedTagMenu : bookmarkTagMenu)
      .map((tag) => `tagIds=${tag.id}`)
      .join("&"),
  });
  console.log(data);

  return (
    <Container sx={{ mt: 5, gridArea: "title" }} maxWidth="md">
      <Typography variant="h4" className={title}>
        タグ管理
      </Typography>
      <Card className={card}>
        <Box className={header}>
          <ul className={listWrap}>
            {bookmarkTagMenu.map((tag) => {
              return (
                <li key={tag.id} className={list}>
                  <button
                    className={clsx(button, {
                      [disabledButton]: !isSelectedTagMenu(
                        tag.id,
                        selectedTagMenu
                      ),
                    })}
                    onClick={() => onClickTagMenu(tag)}
                  >
                    <CheckIcon className={checkIcon} />
                    {tag.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </Box>
        <Box className={body}></Box>
      </Card>
    </Container>
  );
}
