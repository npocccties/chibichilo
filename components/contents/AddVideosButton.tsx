import { useState, useCallback } from "react";
import { AddVideosDialog } from "./AddVideosDialog";
import { VideosRow } from "./VideosSelectorTable";
import Tooltip from "@material-ui/core/Tooltip";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";

export function AddVideosButton(props: {
  videos: Videos;
  onOpen: () => void;
  onClose: (rows: VideosRow[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const handleClickOpen = useCallback(() => {
    setOpen(true);
    props.onOpen();
  }, [setOpen, props.onOpen]);
  const handleClose = useCallback(
    (rows: VideosRow[]) => {
      setOpen(false);
      props.onClose(rows);
    },
    [setOpen, props.onClose]
  );

  return (
    <div>
      <Tooltip title="ビデオを追加する">
        <Fab aria-label="add" onClick={handleClickOpen}>
          <AddIcon />
        </Fab>
      </Tooltip>
      <AddVideosDialog
        open={open}
        videos={props.videos}
        onClose={handleClose}
      />
    </div>
  );
}
