import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import ContentImportForm from "$organisms/ContentImportForm";
import Container from "$atoms/Container";
import BackButton from "$atoms/BackButton";
import type {
  BooksImportParams,
  BooksImportResult,
} from "$server/models/booksImportParams";

const containerSx: SxProps<Theme> = {
  mt: 1,
  "& > :not(.content-import-title):not(.content-import-form)": {
    mb: 2,
  },
};

const titleSx: SxProps<Theme> = {
  mb: 4,
};

const formSx: SxProps<Theme> = {
  mb: 4,
};

type Props = {
  importResult?: BooksImportResult;
  onSubmit(book: BooksImportParams): void;
  onCancel(): void;
  title: string;
};

export default function ContentImport({
  importResult,
  onSubmit,
  onCancel,
  title,
}: Props) {
  const showSuccess = importResult?.errors && importResult.errors.length === 0;
  const showErrors = importResult?.errors && importResult.errors.length > 0;
  const showResult = showSuccess || showErrors;

  return (
    <Container sx={containerSx} maxWidth="lg">
      <BackButton onClick={onCancel}>戻る</BackButton>
      <Typography className="content-import-title" sx={titleSx} variant="h4">
        {title}
      </Typography>
      <Box className="content-import-form" sx={formSx}>
        <ContentImportForm onSubmit={onSubmit} />
      </Box>
      {showResult && (
        <>
          <Typography
            className="content-import-title"
            sx={titleSx}
            variant="h4"
          >
            インポート結果
          </Typography>
          {showSuccess && <ul>成功</ul>}
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
