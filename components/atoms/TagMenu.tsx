import { useCallback } from "react";
import { useLockBodyScroll, useToggle } from "react-use";
import { css } from "@emotion/css";
import { Dropdown } from "@mui/base/Dropdown";
import { Menu as BaseMenu, menuClasses } from "@mui/base/Menu";
import { MenuButton as BaseMenuButton } from "@mui/base/MenuButton";
import { MenuItem as BaseMenuItem, menuItemClasses } from "@mui/base/MenuItem";
import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import { styled } from "@mui/system";
import type {
  BookmarkProps,
  BookmarkTagMenu,
  TagSchema,
} from "$server/models/bookmark";
import Emoji from "./Emoji";

const menuItem = css({
  "> :first-child": {
    marginRight: "8px",
  },
});

type Props = {
  topicId: number;
  selectedTag: TagSchema[];
  tagMenu: BookmarkTagMenu;
  handleTagChange: (tag: TagSchema) => void;
  isBookmarkMemoContent: boolean;
  onSubmitBookmark: (body: BookmarkProps) => Promise<void>;
};

export default function TagMenu({
  topicId,
  selectedTag,
  tagMenu,
  handleTagChange,
  isBookmarkMemoContent,
  onSubmitBookmark,
}: Props) {
  const onClick = useCallback(
    async (option: TagSchema) => {
      handleTagChange(option);
      await onSubmitBookmark({ topicId, tagId: option.id });
    },
    [handleTagChange, onSubmitBookmark, topicId]
  );

  const filterTags = tagMenu.filter((tag) => {
    return selectedTag.every((selected) => selected.id !== tag.id);
  });

  const [locked, toggleLocked] = useToggle(false);

  useLockBodyScroll(locked);

  if (filterTags.length === 0 && isBookmarkMemoContent) {
    return null;
  }

  return (
    <Dropdown
      onOpenChange={() => {
        toggleLocked();
      }}
    >
      <MenuButton>
        <AddReactionOutlinedIcon
          sx={{
            fontSize: 16,
            verticalAlign: "middle",
          }}
        />{" "}
        タグを追加
      </MenuButton>
      <Menu slots={{ listbox: Listbox }}>
        {filterTags.map((option) => (
          <MenuItem
            key={option.id}
            value={option}
            onClick={async () => await onClick(option)}
            className={menuItem}
          >
            <Emoji emoji={option.emoji} />
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  );
}

const MenuButton = styled(BaseMenuButton)(
  () => `
  font-size: 12px;
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: left;
  background: #F9FAFB;
  border: 1px solid #F9FAFB;
  color: #339DFF;
  `
);

const Menu = styled(BaseMenu)(
  () => `
  &.${menuClasses.root} {
    margin-top: -12px !important;
    margin-left: 20px !important;
    // Dialogよりも上に表示する
    z-index: 1301;
  }
  `
);

const Listbox = styled("ul")(
  () => `
  font-size: 12px;
  box-sizing: border-box;
  padding: 6px;
  width: 145px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  background: #fff;
  border: #fff;
  box-shadow: 0px 4px 6px rgba(0,0,0, 0.05)
  `
);

const MenuItem = styled(BaseMenuItem)(
  () => `
  display: flex;
  align-items: center;
  list-style: none;
  padding: 8px;
  cursor: default;
  margin-right: -8px;
  margin-left: -8px;
  font-size: 12px;

  &:hover {
    background-color: #F9FAFB;
  }

  &.${menuItemClasses.focusVisible} {
    background-color: #F9FAFB;
    outline: none;
  }

  > span {
    margin-left: 8px;
  }
  `
);
