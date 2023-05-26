import Placeholder from "$templates/Placeholder";
import useBookTree from "$utils/useBookTree";
import BookTreeDiagram from "$templates/BookTreeDiagram";
import type { TreeNodeType } from "$templates/BookTreeDiagram";
import type { BookSchema } from "$server/models/book";
import React, { useState } from "react";
import type { TreeNodeSchema } from "$server/models/book/tree";
import BookTreeDialog from "$organisms/BookTreeDialog";
import type { Props as BookTreeDialogProps } from "$organisms/BookTreeDialog";
import Dialog from "@mui/material/Dialog";
import IconButton from "$atoms/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: "fixed",
    top: theme.spacing(4),
    right: theme.spacing(3),
    zIndex: 3,
  },
}));

export type VersionTreeDialogProps = {
  book: BookSchema;
  bookId: BookSchema["id"];
  open: boolean;
  onClose: React.MouseEventHandler;
};

export function VersionTreeDialog(props: VersionTreeDialogProps) {
  const { book, bookId, open, onClose } = props;
  const { tree, error } = useBookTree(bookId);
  const [bookTreeDialogProps, setBookTreeDialogProps] = useState<
    Pick<BookTreeDialogProps, "nodeType" | "node" | "open">
  >({ open: false });
  const classes = useStyles();

  if (error || !tree) return <Placeholder />;

  function onNodeClick(
    nodeType: TreeNodeType,
    node: TreeNodeSchema | undefined
  ) {
    setBookTreeDialogProps({
      nodeType,
      node,
      open: true,
    });
  }

  const handleBookTreeDialogClose = () => {
    setBookTreeDialogProps({
      open: false,
    });
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <IconButton
        className={classes.closeButton}
        tooltipProps={{ title: "閉じる" }}
        onClick={onClose}
        size="large"
      >
        <CloseIcon />
      </IconButton>
      <BookTreeDiagram book={book} tree={tree} onNodeClick={onNodeClick} />;
      {bookTreeDialogProps.open && (
        <BookTreeDialog
          {...bookTreeDialogProps}
          onClose={handleBookTreeDialogClose}
        />
      )}
    </Dialog>
  );
}
