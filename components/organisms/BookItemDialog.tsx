import { format, formatDuration, intervalToDuration } from "date-fns";
import { ja } from "date-fns/locale";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/core/styles";
import Item from "$atoms/Item";
import { BookSchema } from "$server/models/book";
import useCardStyles from "$styles/card";

function formatInterval(start: Date | number, end: Date | number) {
  const duration = intervalToDuration({ start, end });
  return formatDuration(duration, { locale: ja });
}

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  items: {
    "& > *": {
      display: "inline-block",
      marginRight: theme.spacing(1.75),
      marginBottom: theme.spacing(1),
    },
  },
  description: {
    whiteSpace: "pre-wrap",
  },
}));

type Props = {
  book: BookSchema;
  open: boolean;
  onClose: React.MouseEventHandler;
};

export default function BookItemDialog(props: Props) {
  const cardClasses = useCardStyles();
  const classes = useStyles();
  const { book, open, onClose } = props;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ classes: cardClasses }}
      fullWidth
    >
      <DialogContent>
        <Typography className={classes.title} variant="h5">
          {book.name}
        </Typography>
        <div className={classes.items}>
          <Typography className={classes.title} variant="h6">
            学習時間
            {formatInterval(0, book?.timeRequired ?? 0 * 1000) || "10秒未満"}
          </Typography>
          <Typography className={classes.title} variant="h6">
            日本語
          </Typography>
          <Typography className={classes.title} variant="h6">
            ライセンス
          </Typography>
        </div>
        <div className={classes.items}>
          <Item itemKey="作成日" value={format(book.createdAt, "yyyy.MM.dd")} />
          <Item itemKey="更新日" value={format(book.updatedAt, "yyyy.MM.dd")} />
          <Item itemKey="著者" value={book.author.name} />
        </div>
        <p className={classes.description}>{book.description}</p>
      </DialogContent>
    </Dialog>
  );
}
