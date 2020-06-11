import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { Contents } from "../contents";
import { ShowContents } from "../ShowContents";

type Props = {
  contents: Contents;
  open: boolean;
  onClose: () => void;
};

export function PreviewContentsDialog(props: Props) {
  if (!props.open)
    return <Dialog open={false} aria-labelledby="PreviewContentsDialog" />;

  return (
    <Dialog
      open
      aria-labelledby="PreviewContentsDialog"
      onClose={props.onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogContent>
        <ShowContents contents={props.contents} />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
