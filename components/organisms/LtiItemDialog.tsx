import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/core/styles";
import Item from "$atoms/Item";
import { Session } from "$server/utils/session";
import useCardStyles from "$styles/card";

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
}));

type Props = {
  session: Session;
  open: boolean;
  onClose: React.MouseEventHandler;
};

export default function LtiItemDialog(props: Props) {
  const cardClasses = useCardStyles();
  const classes = useStyles();
  const { session, open, onClose } = props;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ classes: cardClasses }}
      fullWidth
    >
      <DialogContent>
        <Typography className={classes.title} variant="h5">
          LTI情報
        </Typography>
        {session.ltiLaunchBody &&
          Object.entries(session.ltiLaunchBody).map(([itemKey, value], key) => (
            <Item key={key} itemKey={itemKey} value={value} component="p" />
          ))}
      </DialogContent>
    </Dialog>
  );
}
