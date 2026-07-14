import type { ComponentProps } from "react";
import { useCallback, forwardRef, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import type { SxProps, Theme } from "@mui/material/styles";
import IconButton from "$atoms/IconButton";
import type Book from "$templates/Book";
import { useBookAtom } from "$store/book";
import { useSessionAtom } from "$store/session";
import type { BookSchema } from "$server/models/book";
import { gray } from "$theme/colors";

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const dialogPaperSx: SxProps<Theme> = {
  backgroundColor: gray[50],
};

const closeButtonSx: SxProps<Theme> = {
  position: "fixed",
  top: 4,
  right: 3,
  zIndex: 3,
};

type Props = {
  book: BookSchema;
  open: boolean;
  onClose: React.MouseEventHandler;
  children(
    props: Pick<
      ComponentProps<typeof Book>,
      | "book"
      | "index"
      | "linked"
      | "onTopicEnded"
      | "onItemClick"
      | "considerAppBar"
      | "onContentLinkClick"
    >
  ): React.ReactNode;
};

export default function BookPreviewDialog(props: Props) {
  const { book, open, onClose, children } = props;
  const { itemIndex, nextItemIndex, itemExists, updateItemIndex } =
    useBookAtom(book);
  useEffect(() => {
    updateItemIndex([0, 0]);
  }, [book, updateItemIndex]);
  const { session } = useSessionAtom();
  const handleTopicNext = useCallback(
    (index: ItemIndex = nextItemIndex) => {
      const topic = itemExists(index);
      if (!topic) return;

      updateItemIndex(index);
    },
    [nextItemIndex, itemExists, updateItemIndex]
  );

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: dialogPaperSx },
      }}
      slots={{
        transition: Transition,
      }}
    >
      <IconButton
        sx={closeButtonSx}
        tooltipProps={{ title: "閉じる" }}
        onClick={onClose}
        size="large"
      >
        <CloseIcon />
      </IconButton>
      {children({
        book,
        index: itemIndex,
        linked: book.id === session?.ltiResourceLink?.bookId,
        onTopicEnded: handleTopicNext,
        onItemClick: handleTopicNext,
        considerAppBar: false,
      })}
    </Dialog>
  );
}
