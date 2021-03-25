import useInfiniteScroll from "react-infinite-scroll-hook";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import AddIcon from "@material-ui/icons/Add";
import ActionHeader from "$organisms/ActionHeader";
import BookAccordion from "$organisms/BookAccordion";
import SortSelect from "$atoms/SortSelect";
import CreatorFilter from "$atoms/CreatorFilter";
import SearchTextField from "$atoms/SearchTextField";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import { SortOrder } from "$server/models/sortOrder";
import { Filter } from "$types/filter";
import useContainerStyles from "styles/container";
import { useSearchAtom } from "$store/search";

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
  onFilterChange?(filter: Filter): void;
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
    onFilterChange,
    isTopicEditable,
  } = props;
  const { query, onSearchInput, onLtiContextClick } = useSearchAtom();
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
            ブック
            <Button size="small" color="primary" onClick={handleBookNewClick}>
              <AddIcon className={classes.icon} />
              ブックの作成
            </Button>
          </>
        }
        action={
          <>
            <SortSelect onSortChange={onSortChange} />
            <CreatorFilter onFilterChange={onFilterChange} />
            <SearchTextField
              placeholder="ブック・トピック検索"
              value={query.input}
              onSearchInput={onSearchInput}
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
              onLtiContextClick={onLtiContextClick}
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
