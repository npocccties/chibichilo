import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { Button, DialogActions } from "@mui/material";
import React from "react";

type Props = {
  open: boolean;
  onClose(): void;
  handleDownload(): void;
};

export default function MoveDownloadPageDialog(props: Props) {
  const { open, onClose, handleDownload } = props;

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="p">
          ダウンロードページに移動しますか？
        </Typography>
        <Typography variant="subtitle1" component="p">
          ダウンロードが開始されると、データ容量が大きいため、完了まで数分かかることがあります
        </Typography>
        <Typography variant="subtitle1" component="p">
          ダウンロードを途中で中止したい場合は、ページを更新してください
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button onClick={onClose} color="primary" size="small">
          キャンセル
        </Button>
        <Button
          onClick={async () => {
            await handleDownload();
            await onClose();
          }}
          color="primary"
          size="small"
        >
          ダウンロード開始
        </Button>
      </DialogActions>
    </Dialog>
  );
}
