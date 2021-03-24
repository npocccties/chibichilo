import useInfiniteScroll from "react-infinite-scroll-hook";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import AddIcon from "@material-ui/icons/Add";
import ActionHeader from "$organisms/ActionHeader";
import BookAccordion from "$organisms/BookAccordion";
import SortSelect from "$atoms/SortSelect";
import SearchTextField from "$atoms/SearchTextField";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import { SortOrder } from "$server/models/sortOrder";
import useContainerStyles from "styles/container";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(0.5),
  },
  books: {
    marginTop: theme.spacing(1),
  },
}));

export type Props = {
  books: BookSchema[];
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?(): void;
  onBookClick(book: BookSchema): void;
  onBookEditClick(book: BookSchema): void;
  onBookNewClick(): void;
  onTopicEditClick?(topic: TopicSchema): void;
  onSortChange?(sort: SortOrder): void;
  isTopicEditable?(topic: TopicSchema): boolean | undefined;
};

export default function Books(props: Props) {
  const {
    books,
    loading = false,
    hasNextPage = false,
    onLoadMore = () => undefined,
    onBookClick,
    onBookEditClick,
    onBookNewClick,
    onTopicEditClick,
    onSortChange,
    isTopicEditable,
  } = props;
  const handleBookEditClick = (book: BookSchema) => () => onBookEditClick(book);
  const handleTopicClick = (book: BookSchema) => () => onBookClick(book);
  const handleBookNewClick = () => onBookNewClick();
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  const infiniteRef = useInfiniteScroll<HTMLDivElement>({
    loading,
    hasNextPage,
    onLoadMore,
  });
  return (
    <div ref={infiniteRef}>
      <ActionHeader
        maxWidth="md"
        title={
          <>
            マイブック
            <Button size="small" color="primary" onClick={handleBookNewClick}>
              <AddIcon className={classes.icon} />
              ブックの作成
            </Button>
          </>
        }
        action={
          <>
            <SortSelect onSortChange={onSortChange} />
            {/* TODO: https://github.com/npocccties/ChibiCHiLO/issues/183 */}
            {/* <CreatorFilter /> */}
            <SearchTextField
              placeholder="ブック・トピック検索"
              disabled // TODO: ブック・トピック検索機能追加したら有効化して
            />
          </>
        }
      />
      <Container classes={containerClasses} maxWidth="md">
        <div className={classes.books}>
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
          {loading &&
            [...Array(5)].map((_, i) => <Skeleton key={i} height={64} />)}
        </div>
      </Container>
    </div>
  );
}
