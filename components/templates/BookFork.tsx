import { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ForkOutlinedIcon from "@mui/icons-material/ForkRightOutlined";
import Box from "@mui/material/Box";
import { useConfirm } from "material-ui-confirm";
import LinkSwitch from "$atoms/LinkSwitch";
import Container from "$atoms/Container";
import type { BookSchema } from "$server/models/book";
import ReleasedBookCard, {
  type ReleasedBookCardProps,
} from "$organisms/ReleasedBookCard";

type Props = ReleasedBookCardProps & {
  linked?: boolean;
  onLinkSwitchClick(checked: boolean): void;
  onForkButtonClick(book: Pick<BookSchema, "id">): void;
};

function BookFork(props: Props) {
  const {
    book,
    linked = false,
    onLinkSwitchClick: link,
    onForkButtonClick: fork,
  } = props;
  const confirm = useConfirm();
  const handlers = useMemo(
    () => ({
      async fork() {
        await confirm({
          title: `ブック「${book.name}」をフォークします。よろしいですか？`,
          cancellationText: "キャンセル",
          confirmationText: "OK",
        });
        fork(book);
      },
    }),
    [book, fork, confirm]
  );

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
      <ReleasedBookCard {...props} />
      <Box
        className="released-book-row"
        sx={{
          display: "flex",
          gap: 2,
        }}
      >
        <Typography component="label" variant="caption">
          <LinkSwitch
            defaultChecked={linked}
            onChange={(_, checked) => link(checked)}
          />
          コースへ配信
        </Typography>
        <Button size="small" color="primary" onClick={handlers.fork}>
          <ForkOutlinedIcon />
          フォーク
        </Button>
      </Box>
    </Container>
  );
}

export default BookFork;
