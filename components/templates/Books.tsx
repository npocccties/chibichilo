import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import AddIcon from "@mui/icons-material/Add";
import ActionHeader from "$organisms/ActionHeader";
import ContentTypeIndicator from "$atoms/ContentTypeIndicator";
import ContentPreview from "$organisms/ContentPreview";
import LinkInfo from "$organisms/LinkInfo";
import SearchPagination from "$organisms/SearchPagination";
import SortSelect from "$atoms/SortSelect";
import AuthorFilter from "$atoms/AuthorFilter";
import SearchTextField from "$atoms/SearchTextField";
import type { ContentSchema } from "$server/models/content";
import type { BookSchema } from "$server/models/book";
import type { LinkedBook } from "$types/linkedBook";
import useContainerStyles from "styles/container";
import { useSearchAtom } from "$store/search";

const ContentPreviews = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 296px)",
  gap: theme.spacing(2),
}));

export type Props = {
  totalCount: number;
  contents: ContentSchema[];
  linkedBook?: LinkedBook;
  loading?: boolean;
  onContentPreviewClick(content: ContentSchema): void;
  onContentEditClick(content: ContentSchema): void;
  onContentLinkClick(content: ContentSchema): void;
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
  const handleBookNewClick = () => onBookNewClick();
  const handleBooksImportClick = () => onBooksImportClick();
  const containerClasses = useContainerStyles();

  return (
    <>
      <ActionHeader
        maxWidth="lg"
        title={
          <>
            ブック
            <Button size="small" color="primary" onClick={handleBookNewClick}>
              <AddIcon sx={{ mr: 0.5 }} />
              ブックの作成
            </Button>
            <Button
              size="small"
              color="primary"
              onClick={handleBooksImportClick}
            >
              <AddIcon sx={{ mr: 0.5 }} />
              一括登録
            </Button>
          </>
        }
        body={
          <LinkInfo book={linkedBook} onLinkedBookClick={onLinkedBookClick} />
        }
        action={
          <>
            <ContentTypeIndicator type="book" />
            <SortSelect onSortChange={searchProps.onSortChange} />
            <AuthorFilter onFilterChange={searchProps.onFilterChange} />
            <SearchTextField
              label="ブック・トピック検索"
              value={searchProps.input}
              onSearchInput={searchProps.onSearchInput}
              onSearchInputReset={searchProps.onSearchInputReset}
              onSearchSubmit={searchProps.onSearchSubmit}
            />
          </>
        }
      />
      <Container classes={containerClasses} maxWidth="lg">
        <ContentPreviews>
          {contents.map((content) => (
            <ContentPreview
              key={content.id}
              content={content}
              linked={content.id === linkedBook?.id}
              onContentPreviewClick={onContentPreviewClick}
              onContentEditClick={onContentEditClick}
              onContentLinkClick={onContentLinkClick}
              onLtiContextClick={searchProps.onLtiContextClick}
              onKeywordClick={searchProps.onKeywordClick}
            />
          ))}
          {loading &&
            [...Array(6)].map((_, i) => (
              <Skeleton key={i} height={324} /* TODO: 妥当な値にしてほしい */ />
            ))}
        </ContentPreviews>
        <SearchPagination sx={{ mt: 4 }} totalCount={totalCount} />
      </Container>
    </>
  );
}
