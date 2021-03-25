import { FormEvent, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import AddIcon from "@material-ui/icons/Add";
import ActionHeader from "$organisms/ActionHeader";
import ActionFooter from "$organisms/ActionFooter";
import BookPreview from "$organisms/BookPreview";
import SortSelect from "$atoms/SortSelect";
import CreatorFilter from "$atoms/CreatorFilter";
import SearchTextField from "$atoms/SearchTextField";
import type { BookSchema } from "$server/models/book";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import { SortOrder } from "$server/models/sortOrder";
import { Filter } from "$types/filter";
import useContainerStyles from "$styles/container";
import { useSearchAtom } from "$store/search";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(0.5),
  },
  books: {
    "& > :not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
  form: {
    "& > *": {
      marginRight: theme.spacing(1),
    },
  },
}));

type Props = {
  books: BookSchema[];
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?(): void;
  ltiResourceLink: Pick<LtiResourceLinkSchema, "title">;
  onSubmit(book: BookSchema): void;
  onCancel(): void;
  onBookEditClick(book: BookSchema): void;
  onBookNewClick(): void;
  onSortChange?(sort: SortOrder): void;
  onFilterChange?(filter: Filter): void;
  isBookEditable?(book: BookSchema): boolean | undefined;
};

export default function BookLink(props: Props) {
  const {
    books,
    loading = false,
    hasNextPage = false,
    onLoadMore = () => undefined,
    ltiResourceLink,
    onSubmit,
    onCancel,
    onBookEditClick,
    onBookNewClick,
    onSortChange,
    onFilterChange,
    isBookEditable,
  } = props;
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  const [selectedBookId, selectBookId] = useState<BookSchema["id"] | null>(
    null
  );
  const { query, onSearchInput, onLtiContextClick } = useSearchAtom();
  const handleChecked = (id: BookSchema["id"]) => () => selectBookId(id);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedBookId === null) return;
    const selectedBook = books.find((book) => book.id === selectedBookId);
    if (!selectedBook) return;
    onSubmit(selectedBook);
  };
  const handleBookEditClick = (book: BookSchema) =>
    isBookEditable?.(book) && onBookEditClick;
  const infiniteRef = useInfiniteScroll<HTMLDivElement>({
    loading,
    hasNextPage,
    onLoadMore,
  });
  return (
    <Container ref={infiniteRef} classes={containerClasses} maxWidth="md">
      <ActionHeader
        title={
          <>
            「{ltiResourceLink.title}」で提供
            <Button size="small" color="primary" onClick={onBookNewClick}>
              <AddIcon className={classes.icon} />
              ブックの作成
            </Button>
            <Typography variant="body1">
              提供するブックを選んで下さい
            </Typography>
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
      <div className={classes.books}>
        {books.map((book) => (
          <BookPreview
            key={book.id}
            book={book}
            name="bookId"
            value={book.id}
            checked={selectedBookId === book.id}
            onChange={handleChecked(book.id)}
            onEditClick={handleBookEditClick(book)}
            onLtiContextClick={onLtiContextClick}
          />
        ))}
        {loading &&
          [...Array(5)].map((_, i) => (
            <Skeleton key={i} height={400 /* NOTE: 適当 */} />
          ))}
      </div>
      <ActionFooter maxWidth="md">
        <form className={classes.form} onSubmit={handleSubmit}>
          <Button
            color="primary"
            size="small"
            variant="text"
            onClick={onCancel}
          >
            キャンセル
          </Button>
          {/* TODO: 連携解除機能の実装
          <Button color="primary" size="large" variant="outlined">
            提供解除
          </Button>
          */}
          <Button
            color="primary"
            size="large"
            variant="contained"
            type="submit"
            disabled={selectedBookId == null}
          >
            ブックを提供
          </Button>
        </form>
      </ActionFooter>
    </Container>
  );
}
