import Typography from "@mui/material/Typography";
import Container from "$atoms/Container";
import type { BookSchema } from "$server/models/book";
import ReleaseForm from "$organisms/ReleaseForm";
import Card from "$atoms/Card";
import DescriptionList from "$atoms/DescriptionList";
import getLocaleDateString from "$utils/getLocaleDateString";
import type { ReleaseProps } from "$server/models/book/release";

export type Props = {
  book: BookSchema;
  parentBook?: Pick<BookSchema, "id" | "name" | "release">;
  onSubmit(release: ReleaseProps): void;
};

type ParentBookProps = Partial<Props["parentBook"]>;

function ParentBook(props: ParentBookProps = {}) {
  if (props.id == null) return null;

  return (
    <Card>
      <Typography variant="h5">前回のリリース</Typography>
      <section>
        <Typography variant="h6" gutterBottom>
          {props.release?.version}
        </Typography>
        <DescriptionList
          value={
            [
              {
                key: "ブック",
                value: props.name,
              },
              props.release?.releasedAt instanceof Date && {
                key: "リリース日",
                value: getLocaleDateString(props.release.releasedAt),
              },
              props.release?.comment && {
                key: "コメント",
                value: props.release.comment,
              },
            ].filter(Boolean) as Array<{ key: string; value: string }>
          }
        />
      </section>
    </Card>
  );
}

function ReleaseEdit(props: Props) {
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
      <ReleaseForm
        release={props.book?.release ?? {}}
        onSubmit={props.onSubmit}
      />
      <ParentBook {...props.parentBook} />
    </Container>
  );
}

export default ReleaseEdit;
