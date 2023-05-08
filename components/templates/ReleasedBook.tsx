import { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ForkOutlinedIcon from "@mui/icons-material/ForkRightOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Box from "@mui/material/Box";
import { useConfirm } from "material-ui-confirm";
import LinkSwitch from "$atoms/LinkSwitch";
import Container from "$atoms/Container";
import ReleasedBookCard, {
  type ReleasedBookCardProps,
} from "$organisms/ReleasedBookCard";

type Props = ReleasedBookCardProps & {
  linked?: boolean;
  onLinkSwitchClick(checked: boolean): void;
  onForkButtonClick(): void;
  onReleaseButtonClick(): void;
  onDeleteBook(): void;
  onBookTreeButtonClick(): void;
};

function ReleasedBook(props: Props) {
  const {
    book,
    linked = false,
    onLinkSwitchClick: link,
    onForkButtonClick: fork,
    onReleaseButtonClick: edit,
    onDeleteBook: del,
    onBookTreeButtonClick,
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
        fork();
      },
      edit,
      async del() {
        await confirm({
          title: `ブック「${book.name}」を削除します。よろしいですか？`,
          cancellationText: "キャンセル",
          confirmationText: "OK",
        });
        del();
      },
    }),
    [book, fork, edit, del, confirm]
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
        <Button size="small" color="primary" onClick={handlers.edit}>
          <PeopleOutlinedIcon />
          リリースの編集
        </Button>
        <Button size="small" color="primary" onClick={onBookTreeButtonClick}>
          <PeopleOutlinedIcon />
          ツリー表示
        </Button>{" "}
        <Button size="small" color="primary" onClick={handlers.del}>
          <DeleteOutlinedIcon />
          削除
        </Button>
      </Box>
    </Container>
  );
}

export default ReleasedBook;
