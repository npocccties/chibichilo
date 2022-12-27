import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import type { LtiMemberShipSchema } from "$server/models/ltiMemberShip";
import { Button, DialogActions } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
}));

type Props = {
  memberships: LtiMemberShipSchema;
  open: boolean;
  onClose: React.MouseEventHandler;
};

// TODO：storybook対応
export default function MembershipsDialog(props: Props) {
  const { memberships, open, onClose } = props;
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <IconButton className={classes.closeButton} onClick={onClose}>
        <CloseIcon />
      </IconButton>
      <DialogTitle>
        <Typography variant="h5" component="p">
          {"受講者を同期"}
        </Typography>
        <Typography variant="subtitle1" component="p">
          {/* TODO：文言調整 */}
          {"LMSのユーザーと学習分析データを同期します。"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {/* TODO：ユーザー名をLMSから取得してここで表示する（LMSから取得できない場合、Userデータで表示？） */}
        {memberships.members.map((member) => {
          return (
            <div key={member.user_id}>
              <p>{member.user_id}</p>
            </div>
          );
        })}
      </DialogContent>
      <DialogActions>
        {/* TODO：更新処理を実行する */}
        <Button
          onClick={() => console.log("upsert member db!!")}
          color="primary"
          size="small"
        >
          受講者を同期
        </Button>
      </DialogActions>
    </Dialog>
  );
}
