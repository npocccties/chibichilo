import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import BookItemDialog from "$organisms/BookItemDialog";
import BookTree from "$molecules/BookTree";
import SortSelect from "$atoms/SortSelect";
import SearchTextField from "$atoms/SearchTextField";
import { BookSchema } from "$server/models/book";
import { TopicSchema } from "$server/models/topic";
import { gray } from "$theme/colors";
import useContainerStyles from "$styles/container";

const useStyles = makeStyles((theme) => ({
  line: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: theme.spacing(-2),
    "& > *": {
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  title: {
    marginBottom: theme.spacing(4),
    "& > *": {
      marginRight: theme.spacing(1),
    },
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: gray[50],
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  icon: {
    marginRight: theme.spacing(0.5),
  },
  books: {
    "&> :not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
}));

type Props = {
  books: BookSchema[];
  onBookEditClick?(book: BookSchema): void;
  onTopicClick(topic: TopicSchema): void;
  onTreeChange?(nodeId: string): void;
};

export default function BookImport(props: Props) {
  const { books, onBookEditClick, onTopicClick, onTreeChange } = props;
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  const [open, setOpen] = useState(false);
  const [currentBook, setBook] = useState<BookSchema | null>(null);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Container classes={containerClasses} maxWidth="md">
      <div className={classes.header}>
        <Typography className={classes.title} variant="h4" gutterBottom={true}>
          ブックからインポート
          <Typography variant="body1">
            ブックからインポートしたいトピックを選んでください
          </Typography>
        </Typography>
        <div className={classes.line}>
          <Button color="primary" size="large" variant="contained">
            ブックをインポート
          </Button>
          <SortSelect disabled /* TODO: ソート機能を追加したら有効化して */ />
          <SearchTextField
            placeholder="ブック・トピック検索"
            disabled // TODO: ブック・トピック検索機能追加したら有効化して
          />
        </div>
      </div>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {books.map((book) => {
          const handleItemClick = ([sectionIndex, topicIndex]: ItemIndex) =>
            onTopicClick(book.sections[sectionIndex].topics[topicIndex]);
          const handleBookInfoClick = () => {
            setBook(book);
            setOpen(true);
          };
          const handleBookEditClick = () => {
            setBook(book);
            onBookEditClick && currentBook && onBookEditClick(currentBook);
          };
          return (
            <BookTree
              key={book.id}
              book={book}
              onItemClick={handleItemClick}
              onItemEditClick={handleItemClick}
              onBookInfoClick={handleBookInfoClick}
              onBookEditClick={handleBookEditClick}
              onTreeChange={onTreeChange}
            />
          );
        })}
      </TreeView>
      {currentBook && (
        <BookItemDialog open={open} onClose={handleClose} book={currentBook} />
      )}
    </Container>
  );
}
