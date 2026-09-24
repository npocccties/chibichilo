import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import BooksImportForm from "$organisms/BooksImportForm";
import ContentPreview from "$organisms/ContentPreview";
import Container from "$atoms/Container";
import BackButton from "$atoms/BackButton";
import { useSearchAtom } from "$store/search";
import type {
  BooksImportParams,
  BooksImportResult,
} from "$server/models/booksImportParams";
import type { ContentSchema } from "$server/models/content";
import type { AuthorSchema } from "$server/models/author";

const containerSx: SxProps<Theme> = {
  mt: 1,
  "& > :not(.books-import-title):not(.books-import-form)": {
    mb: 2,
  },
};

const titleSx: SxProps<Theme> = {
  mb: 4,
};

const formSx: SxProps<Theme> = {
  mb: 4,
};

const booksSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 296px)",
  gap: 2,
};

type Props = {
  importResult?: BooksImportResult;
  onContentPreviewClick(content: ContentSchema): void;
  onSubmit(book: BooksImportParams): void;
  onCancel(): void;
  onAuthorSubmit(author: Pick<AuthorSchema, "email">): void;
};

export default function BooksImport({
  importResult,
  onContentPreviewClick,
  onSubmit,
  onCancel,
  onAuthorSubmit,
}: Props) {
  const searchProps = useSearchAtom();

  const showSuccess = importResult?.books && importResult.books.length > 0;
  const showErrors = importResult?.errors && importResult.errors.length > 0;
  const showResult = showSuccess || showErrors;
  const showForm = !showSuccess;

  return (
    <Container sx={containerSx} maxWidth="lg">
      <BackButton onClick={onCancel}>戻る</BackButton>
      {showForm && (
        <>
          <Typography className="books-import-title" sx={titleSx} variant="h4">
            ブックのインポート
          </Typography>
          <Box className="books-import-form" sx={formSx}>
            <BooksImportForm
              onSubmit={onSubmit}
              onAuthorSubmit={onAuthorSubmit}
            />
          </Box>
        </>
      )}
      {showResult && (
        <>
          <Typography className="books-import-title" sx={titleSx} variant="h4">
            インポート結果
          </Typography>
          {showSuccess && (
            <Box sx={booksSx}>
              {importResult?.books?.map((book) => (
                <ContentPreview
                  key={book.id}
                  content={{ type: "book", ...book }}
                  onContentPreviewClick={onContentPreviewClick}
                  onKeywordClick={searchProps.onKeywordClick}
                />
              ))}
            </Box>
          )}
          {showErrors && (
            <ul>
              {importResult?.errors?.map((error, index) => (
                <li key={index}>
                  <pre>{error}</pre>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Container>
  );
}
