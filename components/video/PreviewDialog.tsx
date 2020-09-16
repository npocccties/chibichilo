import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { VideoPlayer } from "components/VideoPlayer";

type Props = {
  video: Video;
  open: boolean;
  onClose: () => void;
};

export function PreviewDialog(props: Props) {
  if (!props.open)
    return <Dialog open={false} aria-labelledby="PreviewDialog" />;

  return (
    <Dialog
      open
      aria-labelledby="PreviewDialog"
      onClose={props.onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogContent>
        <VideoPlayer autoplay {...props.video} />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
