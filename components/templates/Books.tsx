import useInfiniteScroll from "react-infinite-scroll-hook";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import ActionHeader from "$organisms/ActionHeader";
import BookPreview from "$organisms/BookPreview";
import SortSelect from "$atoms/SortSelect";
import CreatorFilter from "$atoms/CreatorFilter";
import SearchTextField from "$atoms/SearchTextField";
import type { BookSchema } from "$server/models/book";
import type { LinkedBook } from "$types/linkedBook";
import { SortOrder } from "$server/models/sortOrder";
import { Filter } from "$types/filter";
import useContainerStyles from "styles/container";
import { useSearchAtom } from "$store/search";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(0.5),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  books: {
    marginTop: theme.spacing(1),
    "& > *": {
      marginBottom: theme.spacing(2),
    },
  },
}));

export type Props = {
  books: BookSchema[];
  linkedBook?: LinkedBook;
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?(): void;
  onBookClick?(book: BookSchema): void;
  onBookEditClick(book: BookSchema): void;
  onBookNewClick(): void;
  onSortChange?(sort: SortOrder): void;
  onFilterChange?(filter: Filter): void;
};

export default function Books(props: Props) {
  const {
    books,
    linkedBook,
    loading = false,
    hasNextPage = false,
    onLoadMore = () => undefined,
    onBookClick,
    onBookEditClick,
    onBookNewClick,
    onSortChange,
    onFilterChange,
  } = props;
  const { query, onSearchInput, onLtiContextClick } = useSearchAtom();
  const handleBookClick = (book: BookSchema) => () => onBookClick?.(book);
  const handleBookEditClick = (book: BookSchema) => () => onBookEditClick(book);
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
        body={
          <>
            <Typography className={classes.title} variant="h5">
              提供中のブック
            </Typography>
            {linkedBook && (
              <BookPreview
                book={linkedBook}
                onBookClick={handleBookClick(linkedBook)}
                onBookEditClick={
                  linkedBook.editable
                    ? handleBookEditClick(linkedBook)
                    : undefined
                }
                onLtiContextClick={onLtiContextClick}
              />
            )}
            {!linkedBook && (
              <Typography variant="body2">
                提供中のブックがありません。
                <br />
                ブックを提供するには、提供したいブックの「もっと詳しく...」をクリックしたのち「このブックを提供」をクリックしてください。
              </Typography>
            )}
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
            <BookPreview
              key={book.id}
              book={book}
              onBookClick={handleBookClick(book)}
              onBookEditClick={handleBookEditClick(book)}
              onLtiContextClick={onLtiContextClick}
            />
          ))}
          {loading &&
            [...Array(5)].map((_, i) => <Skeleton key={i} height={64} />)}
        </div>
      </Container>
    </div>
  );
}
