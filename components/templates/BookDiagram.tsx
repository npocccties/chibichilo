import Typography from "@mui/material/Typography";
import Container from "$atoms/Container";
import Card from "$atoms/Card";
import type { TreeResultSchema } from "$server/models/book/tree";
import type { BookSchema } from "$server/models/book";

type Props = {
  book: BookSchema;
  tree: TreeResultSchema;
};

function BookDiagram(props: Props) {
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
      <Typography variant="h4">{props.book.name}</Typography>
      <Card id="card"></Card>
    </Container>
  );
}

export default BookDiagram;
