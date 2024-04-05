import { Box, TextField, Button as MuiButton } from "@mui/material";
import TagWithDeleteButton from "$atoms/TagWithDeleteButton";
import TagMenu from "$atoms/TagMenu";
import useBookmarkHandler from "$utils/bookmark/useBookmarkHandler";
import type {
  BookmarkProps,
  BookmarkSchema,
  BookmarkTagMenu,
  TagSchema,
} from "$server/models/bookmark";
import { useCallback, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { useConfirm } from "material-ui-confirm";
import type { BookmarkParams } from "$server/validators/bookmarkParams";

import { Button } from "@mui/base/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { css } from "@emotion/css";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import type { BookmarkMemoContentProps } from "$server/models/bookmarkMemoContent";
import { useForm } from "react-hook-form";

const tooltipClass = css({
  "> :first-child": {
    marginRight: "8px",
  },
});

const text = css({
  margin: "0",
});

const closeButtonClass = css({
  position: "absolute",
  top: "4px",
  right: "4px",
});

const alertClass = css({
  color: "red",
  fontSize: "12px",
});

type Props = {
  topicId: number;
  bookmarks: BookmarkSchema[];
  tagMenu: BookmarkTagMenu;
};

export default function TagList({ topicId, bookmarks, tagMenu }: Props) {
  const handlers = useBookmarkHandler();
  const [selectedTag, setSelectedTag] = useState<TagSchema[]>(
    bookmarks
      .map((bookmark) => bookmark.tag)
      .filter((tag) => tag !== null) as TagSchema[]
  );
  const handleTagChange = useCallback((tag: TagSchema) => {
    setSelectedTag((prev) => [...prev, tag]);
  }, []);

  const isBookmarkMemoContent = bookmarks.some(
    (bookmark) => bookmark.tag === null
  );
  const bookmarkMemoContent = bookmarks.find(
    (bookmark) => bookmark.tag === null
  );

  const confirm = useConfirm();
  const handleBookmarkDeleteClick = async (
    id: BookmarkParams["id"],
    topicId: BookmarkProps["topicId"]
  ) => {
    await confirm({
      title: "コメントを削除します。よろしいですか？",
      cancellationText: "キャンセル",
      confirmationText: "OK",
    });
    await handlers.onDeleteBookmark(id, topicId);
  };
  const [open, setOpen] = useState(false);
  const defaultValues: BookmarkMemoContentProps = {
    memoContent: bookmarkMemoContent?.memoContent ?? "",
    topicId,
  };
  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<BookmarkMemoContentProps>({
    defaultValues,
  });
  const onClose = () => {
    reset();
    setOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexWrap: "wrap",
        boxSizing: "border-box",
        width: "100%",
        margin: "4px 0px",
        padding: "4px 8px",
        borderRadius: "8px",
        textAlign: "left",
        background: "#F9FAFB",
        border: "1px solid #F9FAFB",
      }}
    >
      {selectedTag.map((tag) => {
        const bookmark = bookmarks.find(
          (bookmark) => bookmark.tagId === tag.id
        );
        if (!bookmark) {
          return null;
        }
        return (
          <TagWithDeleteButton
            key={tag.id}
            topicId={topicId}
            bookmark={bookmark}
            {...handlers}
          />
        );
      })}
      <TagMenu
        topicId={topicId}
        selectedTag={selectedTag}
        tagMenu={tagMenu}
        handleTagChange={handleTagChange}
        isBookmarkMemoContent={isBookmarkMemoContent}
        {...handlers}
      />
      <Tooltip
        title="教材の感想を自由に書いてください。感想は匿名で共有されます。"
        placement="bottom-start"
        className={tooltipClass}
      >
        <Button
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "12px",
            boxSizing: "border-box",
            borderRadius: "8px",
            textAlign: "left",
            background: "#F9FAFB",
            border: "1px solid #F9FAFB",
            color: "#339DFF",
            cursor: "pointer",
            padding: "0",
            margin: "0",
          }}
          onClick={() => setOpen(true)}
        >
          {isBookmarkMemoContent ? (
            <ChatBubbleIcon
              sx={{
                fontSize: 16,
                margin: "0 2px 0 0 !important",
              }}
            />
          ) : (
            <ChatBubbleOutlineIcon
              sx={{
                fontSize: 16,
                margin: "0 2px 0 0 !important",
              }}
            />
          )}
          <p className={text}>コメント</p>
        </Button>
      </Tooltip>
      <Dialog open={open} onClose={onClose} fullWidth sx={{ margin: "24px" }}>
        <IconButton className={closeButtonClass} onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <DialogTitle sx={{ marginBottom: 0 }}>
          <Typography
            variant="h5"
            component="p"
            sx={{ fontWeight: "bold", marginBottom: "20px" }}
          >
            教材についてのコメントを入力
          </Typography>
          <Typography variant="subtitle1" component="p">
            教材のコメントを自由に書いてください。コメントは匿名で共有されます。
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit(async (values) => {
              if (bookmarkMemoContent) {
                await handlers.onUpdateBookmarkMemoContent(
                  bookmarkMemoContent.id,
                  values
                );
                return;
              }
              await handlers.onSubmitBookmarkMemoContent(values);
            })}
            sx={{ marginTop: "20px" }}
          >
            <TextField
              label="コメントを入力..."
              multiline
              rows={4}
              fullWidth
              sx={{ borderRadius: "8px" }}
              inputProps={register("memoContent", { required: "必須項目です" })}
              aria-invalid={errors.memoContent ? "true" : "false"}
            />
            {errors.memoContent && (
              <p role="alert" className={alertClass}>
                {errors.memoContent?.message}
              </p>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              {bookmarkMemoContent && (
                <MuiButton
                  variant="outlined"
                  color="inherit"
                  type="button"
                  onClick={() =>
                    handleBookmarkDeleteClick(bookmarkMemoContent.id, topicId)
                  }
                >
                  削除
                </MuiButton>
              )}
              <MuiButton
                variant="outlined"
                color="inherit"
                type="button"
                onClick={onClose}
              >
                キャンセル
              </MuiButton>
              <MuiButton
                variant="contained"
                color="primary"
                type="submit"
                disabled={watch("memoContent") === defaultValues.memoContent}
              >
                保存
              </MuiButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
