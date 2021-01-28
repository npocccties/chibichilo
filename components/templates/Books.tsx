import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import AddIcon from "@material-ui/icons/Add";
import LinkIcon from "@material-ui/icons/Link";
import BookAccordion from "$organisms/BookAccordion";
import SortSelect from "$atoms/SortSelect";
import SearchTextField from "$atoms/SearchTextField";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import useContainerStyles from "styles/container";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  line: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
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
  icon: {
    marginRight: theme.spacing(0.5),
  },
}));

type Props = {
  books: BookSchema[];
  ltiResourceLink?: Pick<LtiResourceLinkSchema, "title"> | null;
  onBookClick(book: BookSchema): void;
  onBookEditClick(book: BookSchema): void;
  onBookNewClick(): void;
  onBookLinkClick(): void;
  onTopicEditClick?(topic: TopicSchema): void;
  isTopicEditable?(topic: TopicSchema): boolean | undefined;
};

export default function Books(props: Props) {
  const {
    books,
    ltiResourceLink,
    onBookClick,
    onBookEditClick,
    onBookNewClick,
    onBookLinkClick,
    onTopicEditClick,
    isTopicEditable,
  } = props;
  const handleBookEditClick = (book: BookSchema) => () => onBookEditClick(book);
  const handleTopicClick = (book: BookSchema) => () => onBookClick(book);
  const handleBookNewClick = () => onBookNewClick();
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  return (
    <Container
      classes={containerClasses}
      className={classes.container}
      maxWidth="md"
    >
      <Typography className={classes.title} variant="h4" gutterBottom={true}>
        マイブック
        <Button size="small" color="primary" onClick={handleBookNewClick}>
          <AddIcon className={classes.icon} />
          ブックの作成
        </Button>
        {ltiResourceLink && (
          <Button size="small" color="primary" onClick={onBookLinkClick}>
            <LinkIcon className={classes.icon} />
            LTIリンク「{ltiResourceLink.title}」と連携
          </Button>
        )}
      </Typography>
      <div className={classes.line}>
        <SortSelect disabled /* TODO: ソート機能を追加したら有効化して */ />
        <SearchTextField
          placeholder="ブック・トピック検索"
          disabled // TODO: ブック・トピック検索機能追加したら有効化して
        />
      </div>
      <div>
        {books.map((book) => (
          <BookAccordion
            key={book.id}
            book={book}
            onEditClick={handleBookEditClick(book)}
            onTopicClick={handleTopicClick(book)}
            onTopicEditClick={onTopicEditClick}
            isTopicEditable={isTopicEditable}
          />
        ))}
      </div>
    </Container>
  );
}
