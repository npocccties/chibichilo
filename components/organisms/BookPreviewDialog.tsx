import type { ComponentProps } from "react";
import { useCallback, forwardRef, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import makeStyles from "@mui/styles/makeStyles";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
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

const useDialogStyles = makeStyles({
  paper: {
    backgroundColor: gray[50],
  },
});

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: "fixed",
    top: theme.spacing(4),
    right: theme.spacing(3),
    zIndex: 3,
  },
}));

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
    >
  ): React.ReactNode;
};

export default function BookPreviewDialog(props: Props) {
  const { book, open, onClose, children } = props;
  const dialogClasses = useDialogStyles();
  const classes = useStyles();
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
      classes={dialogClasses}
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <IconButton
        className={classes.closeButton}
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
