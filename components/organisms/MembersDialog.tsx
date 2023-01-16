import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import {
  Button,
  DialogActions,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import type { LtiNrpsContextMemberSchema } from "$server/models/ltiNrpsContextMember";

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
}));

type Props = {
  members: LtiNrpsContextMemberSchema[];
  open: boolean;
  onClose: React.MouseEventHandler;
  handleUpdateLtiMembers: (userIds: string[]) => Promise<void>;
};

// TODO：storybook対応
export default function MembersDialog(props: Props) {
  const { members, open, onClose, handleUpdateLtiMembers } = props;
  const classes = useStyles();

  const ltiUserIds = members.map((member) => member.user_id);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <IconButton className={classes.closeButton} onClick={onClose}>
        <CloseIcon />
      </IconButton>
      <DialogTitle>
        <Typography variant="h5" component="p">
          受講者の同期
        </Typography>
        <Typography variant="subtitle1" component="p">
          LMSからコースの受講者に関する情報を取得し、反映します。
        </Typography>
      </DialogTitle>
      <DialogContent>
        <List disablePadding={false}>
          {members.map((member) => {
            return (
              <>
                <ListItem key={member.user_id} dense={true}>
                  <Grid container>
                    <Grid item xs={5}>
                      <ListItemText>ID: {member.user_id}</ListItemText>
                    </Grid>
                    <Grid item xs={5}>
                      <ListItemText>名前: 未公開</ListItemText>
                    </Grid>
                  </Grid>
                </ListItem>
                <Divider />
              </>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={async () => await handleUpdateLtiMembers(ltiUserIds)}
          color="primary"
          size="small"
        >
          同期
        </Button>
      </DialogActions>
    </Dialog>
  );
}
