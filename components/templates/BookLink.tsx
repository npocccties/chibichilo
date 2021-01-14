import { FormEvent, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import AddIcon from "@material-ui/icons/Add";
import BookPreview from "$organisms/BookPreview";
import SortSelect from "$atoms/SortSelect";
import SearchTextField from "$atoms/SearchTextField";
import type { BookSchema } from "$server/models/book";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import { gray } from "theme/colors";
import useContainerStyles from "styles/container";

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
  ltiResourceLink: Pick<LtiResourceLinkSchema, "title">;
  onSubmit(bookId: BookSchema["id"]): void;
  onBookEditClick(book: BookSchema): void;
  onBookNewClick(): void;
};

export default function BookLink(props: Props) {
  const {
    books,
    ltiResourceLink,
    onSubmit,
    onBookEditClick,
    onBookNewClick,
  } = props;
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  const [selectedBook, selectBook] = useState<BookSchema["id"] | null>(null);
  const handleChecked = (id: BookSchema["id"]) => () => selectBook(id);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedBook != null) onSubmit(selectedBook);
  };
  const handleBookEditClick = (_: never, book: BookSchema) => {
    onBookEditClick(book);
  };
  return (
    <Container classes={containerClasses} maxWidth="md">
      <form className={classes.header} onSubmit={handleSubmit}>
        <Typography className={classes.title} variant="h4" gutterBottom={true}>
          LTIリンク「{ltiResourceLink.title}」と連携
          <Button size="small" color="primary" onClick={onBookNewClick}>
            <AddIcon className={classes.icon} />
            ブックの作成
          </Button>
          <Typography variant="body1">
            LTIリンクと連携したいブックを選んでください
          </Typography>
        </Typography>
        <div className={classes.line}>
          <Button
            color="primary"
            size="large"
            variant="contained"
            type="submit"
            disabled={selectedBook == null}
          >
            ブックを連携
          </Button>
          <Button
            color="primary"
            size="large"
            variant="outlined"
            disabled={true /* TODO: 連携解除機能を追加したら取り除くべき */}
          >
            連携解除
          </Button>
          <SortSelect />
          <SearchTextField placeholder="ブック・トピック検索" />
        </div>
      </form>
      <div className={classes.books}>
        {books.map((book) => (
          <BookPreview
            key={book.id}
            book={book}
            name="bookId"
            value={book.id}
            checked={selectedBook === book.id}
            onChange={handleChecked(book.id)}
            onEditClick={handleBookEditClick}
          />
        ))}
      </div>
    </Container>
  );
}
