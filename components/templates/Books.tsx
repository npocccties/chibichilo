import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ActionHeader from "$organisms/ActionHeader";
import ContentTypeIndicator from "$atoms/ContentTypeIndicator";
import ContentPreview from "$organisms/ContentPreview";
import LinkInfo from "$organisms/LinkInfo";
import FilterColumn from "$organisms/FilterColumn";
import SearchPagination from "$organisms/SearchPagination";
import Search from "$organisms/Search";
import Container from "$atoms/Container";
import SortSelect from "$atoms/SortSelect";
import type { ContentSchema } from "$server/models/content";
import type { BookSchema } from "$server/models/book";
import type { LinkedBook } from "$types/linkedBook";
import { useSearchAtom } from "$store/search";
import { useSessionAtom } from "$store/session";

export type Props = {
  totalCount: number;
  contents: ContentSchema[];
  linkedBook?: LinkedBook;
  loading?: boolean;
  onContentPreviewClick(content: ContentSchema): void;
  onContentEditClick(content: ContentSchema): void;
  onContentLinkClick?(content: ContentSchema, checked: boolean): void;
  onLinkedBookClick?(book: BookSchema): void;
  onBookNewClick(): void;
  onBooksImportClick(): void;
};

export default function Books(props: Props) {
  const {
    totalCount,
    contents,
    linkedBook,
    loading = false,
    onContentPreviewClick,
    onContentEditClick,
    onContentLinkClick,
    onLinkedBookClick,
    onBookNewClick,
    onBooksImportClick,
  } = props;
  const searchProps = useSearchAtom();
  const { isContentEditable } = useSessionAtom();
  const handleBookNewClick = () => onBookNewClick();
  const handleBooksImportClick = () => onBooksImportClick();

  return (
    <Container twoColumns maxWidth="xl">
      <Typography sx={{ mt: 5, gridArea: "title" }} variant="h4">
        ブック
        <Button size="small" color="primary" onClick={handleBookNewClick}>
          <AddIcon sx={{ mr: 0.5 }} />
          ブックの作成
        </Button>
        <Button size="small" color="primary" onClick={handleBooksImportClick}>
          <AddIcon sx={{ mr: 0.5 }} />
          一括登録
        </Button>
      </Typography>
      <LinkInfo
        sx={{ mt: 1, gridArea: "description" }}
        book={linkedBook}
        onLinkedBookClick={onLinkedBookClick}
      />
      <ActionHeader sx={{ gridArea: "action-header" }}>
        <ContentTypeIndicator type="book" />
        <SortSelect onSortChange={searchProps.onSortChange} />
        <Search
          label="ブック・トピック検索"
          value={searchProps.input}
          target={searchProps.target}
          onSearchInput={searchProps.onSearchInput}
          onSearchInputReset={searchProps.onSearchInputReset}
          onSearchSubmit={searchProps.onSearchSubmit}
          onSearchTargetChange={searchProps.onSearchTargetChange}
        />
      </ActionHeader>
      <FilterColumn sx={{ gridArea: "side" }} variant="book" />
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, 296px)"
        gap={2}
        gridArea="items"
      >
        {contents.map((content) => (
          <ContentPreview
            key={content.id}
            content={content}
            linked={content.id === linkedBook?.id}
            onContentPreviewClick={onContentPreviewClick}
            onContentEditClick={
              isContentEditable(content) ? onContentEditClick : undefined
            }
            onContentLinkClick={onContentLinkClick}
            onLtiContextClick={searchProps.onLtiContextClick}
            onKeywordClick={searchProps.onKeywordClick}
          />
        ))}
        {loading &&
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} height={324} /* TODO: 妥当な値にしてほしい */ />
          ))}
      </Box>
      <SearchPagination
        sx={{ mt: 4, gridArea: "search-pagination" }}
        totalCount={totalCount}
      />
    </Container>
  );
}
