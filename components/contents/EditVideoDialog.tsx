import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import { Video } from "components/video";
import { EditVideoForm } from "components/EditVideo";

type Props = {
  video: Video;
  open: boolean;
  onClose: () => void;
};

export function EditVideoDialog(props: Props) {
  if (!props.open)
    return <Dialog open={false} aria-labelledby="EditVideoDialog" />;

  return (
    <Dialog
      open
      aria-labelledby="EditVideoDialog"
      onClose={props.onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogContent>
        <EditVideoForm
          video={props.video}
          onSave={props.onClose}
          onCancel={props.onClose}
          saveActionLabel="このビデオを保存する"
          cancelActionLabel="キャンセル"
        />
      </DialogContent>
    </Dialog>
  );
}
