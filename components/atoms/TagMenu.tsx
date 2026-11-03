import { useCallback, useState, type MouseEvent } from "react";
import useLockBodyScroll from "$utils/useLockBodyScroll";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import { styled } from "@mui/material/styles";
import type {
  BookmarkProps,
  BookmarkTagMenu,
  TagSchema,
} from "$server/models/bookmark";
import Emoji from "./Emoji";

const MenuButton = styled(Button)`
  font-size: 12px;
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: left;
  background: #f9fafb;
  border: 1px solid #f9fafb;
  color: #339dff;
  text-transform: none;
  min-width: 0;

  &:hover {
    background: #f9fafb;
  }
`;

const StyledMenuItem = styled(MenuItem)`
  display: flex;
  align-items: center;
  list-style: none;
  padding: 8px;
  font-size: 12px;

  &:hover {
    background-color: #f9fafb;
  }

  > :first-of-type {
    margin-right: 8px;
  }
`;

type Props = {
  topicId: number;
  bookId: number;
  selectedTag: TagSchema[];
  tagMenu: BookmarkTagMenu;
  handleTagChange: (tag: TagSchema) => void;
  isBookmarkMemoContent: boolean;
  onSubmitBookmark: (body: BookmarkProps) => Promise<void>;
};

export default function TagMenu({
  topicId,
  bookId,
  selectedTag,
  tagMenu,
  handleTagChange,
  isBookmarkMemoContent,
  onSubmitBookmark,
}: Props) {
  const onClick = useCallback(
    async (option: TagSchema) => {
      handleTagChange(option);
      await onSubmitBookmark({ topicId, bookId, tagId: option.id });
    },
    [handleTagChange, onSubmitBookmark, topicId, bookId]
  );

  const filterTags = tagMenu.filter((tag) => {
    return selectedTag.every((selected) => selected.id !== tag.id);
  });

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  useLockBodyScroll(open);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (filterTags.length === 0 && isBookmarkMemoContent) {
    return null;
  }

  return (
    <>
      <MenuButton onClick={handleOpen}>
        <AddReactionOutlinedIcon
          sx={{
            fontSize: 16,
            verticalAlign: "middle",
          }}
        />{" "}
        タグを追加
      </MenuButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          list: { sx: { p: "6px", width: 145 } },
          paper: {
            sx: {
              borderRadius: "12px",
              boxShadow: "0px 4px 6px rgba(0,0,0, 0.05)",
            },
          },
        }}
        // Dialogよりも上に表示する
        sx={{ zIndex: 1301 }}
      >
        {filterTags.map((option) => (
          <StyledMenuItem
            key={option.id}
            onClick={async () => {
              handleClose();
              await onClick(option);
            }}
          >
            <Emoji emoji={option.emoji} />
            {option.label}
          </StyledMenuItem>
        ))}
      </Menu>
    </>
  );
}
