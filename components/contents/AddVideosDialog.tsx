import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { Videos } from "components/video";
import { useState, useEffect, useCallback } from "react";
import { VideosSelectorTable, VideosRow } from "./VideosSelectorTable";

type Props = {
  open: boolean;
  videos: Videos;
  onClose: (rows: VideosRow[]) => void;
};

export function AddVideosDialog(props: Props) {
  const { open, onClose, videos } = props;
  const [rows, setRows] = useState<VideosRow[]>([]);
  useEffect(() => {
    if (open && videos.state === "success") setRows(videos.videos);
  }, [open, videos.state, setRows]);
  const handleClose = useCallback(() => {
    onClose([]);
  }, [onClose]);
  const handleSelect = useCallback(
    (selected: VideosRow[]) => {
      onClose(
        selected.map(({ id, title, description }) => ({
          id,
          title,
          description,
        }))
      );
    },
    [onClose]
  );

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      fullWidth
      maxWidth="lg"
    >
      <VideosSelectorTable rows={rows} onSelect={handleSelect} />
      <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
      </DialogActions>
    </Dialog>
  );
}
