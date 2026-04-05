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
import React, { Fragment } from "react";

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
}));

type Props = {
  members: LtiNrpsContextMemberSchema[] | undefined;
  newLtiMembers: LtiNrpsContextMemberSchema[];
  open: boolean;
  onClose: () => void;
  handleUpdateLtiMembers: (
    members: LtiNrpsContextMemberSchema[] | undefined
  ) => Promise<void>;
  firstTime: boolean;
};

// TODO：storybook対応
export default function MembersDialog(props: Props) {
  const {
    members,
    newLtiMembers,
    open,
    onClose,
    handleUpdateLtiMembers,
    firstTime,
  } = props;
  const classes = useStyles();
  if (firstTime && members && newLtiMembers.length === 0) {
    onClose();
    return null;
  }
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
        {!members && (
          <Typography variant="body1" component="p">
            新規の受講者を確認しています。
          </Typography>
        )}
        {members && newLtiMembers.length === 0 && (
          <Typography variant="body1" component="p">
            新規の受講者は存在しません。
          </Typography>
        )}
        {members && newLtiMembers.length > 0 && (
          <List disablePadding={false}>
            {newLtiMembers.map((member) => {
              return (
                <Fragment key={member.user_id}>
                  <Typography variant="body1" component="p">
                    新規の受講者
                  </Typography>
                  <ListItem dense={true}>
                    <Grid container>
                      <Grid item xs={5}>
                        <ListItemText>ID: {member.user_id}</ListItemText>
                      </Grid>
                      <Grid item xs={5}>
                        <ListItemText>
                          名前: {member?.name || "未公開"}
                        </ListItemText>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <Divider />
                </Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" size="small">
          キャンセル
        </Button>
        <Button
          onClick={async () => await handleUpdateLtiMembers(members)}
          color="primary"
          size="small"
          disabled={!members || newLtiMembers.length === 0}
        >
          同期
        </Button>
      </DialogActions>
    </Dialog>
  );
}
