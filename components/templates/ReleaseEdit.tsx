import Typography from "@mui/material/Typography";
import Container from "$atoms/Container";
import type { BookSchema } from "$server/models/book";
import ReleaseForm from "$organisms/ReleaseForm";
import type { ReleaseProps } from "$server/models/book/release";

export type Props = {
  book: BookSchema;
  onSubmit(release: ReleaseProps): void;
};

function ReleaseEdit(props: Props) {
  const { book, onSubmit } = props;
  const handleSubmit = (props: ReleaseProps) => {
    onSubmit({ ...props });
  };
  return (
    <Container
      maxWidth="md"
      sx={{
        my: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h4">{book.name}</Typography>
      <ReleaseForm release={book.release ?? {}} onSubmit={handleSubmit} />
    </Container>
  );
}

export default ReleaseEdit;
