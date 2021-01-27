import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import { DeleteOutlined } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import BookEditChildren from "$organisms/BookEditChildren";
import BookForm from "$organisms/BookForm";
import TopicPreviewDialog from "$organisms/TopicPreviewDialog";
import RequiredDot from "$atoms/RequiredDot";
import useContainerStyles from "styles/container";
import { BookProps, BookSchema } from "$server/models/book";
import { SectionProps } from "$server/models/book/section";
import { TopicSchema } from "$server/models/topic";
import { useConfirm } from "material-ui-confirm";
import useDialogProps from "$utils/useDialogProps";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "flex-end",
  },
  container: {
    marginTop: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(4),
    "& span": {
      verticalAlign: "middle",
    },
    "& .RequiredDot": {
      marginRight: theme.spacing(0.5),
      marginBottom: theme.spacing(0.75),
      marginLeft: theme.spacing(2),
    },
  },
  children: {
    marginBottom: theme.spacing(2),
  },
  form: {
    marginBottom: theme.spacing(2),
  },
}));

type Props = {
  book: BookSchema | null;
  onSubmit(book: BookProps): void;
  onDelete(book: BookSchema): void;
  onAddSection(props: SectionProps): void;
  onTopicImportClick(): void;
  onTopicNewClick(): void;
  onBookImportClick(): void;
};

export default function BookEdit(props: Props) {
  const {
    book,
    onSubmit,
    onDelete,
    onAddSection,
    onTopicImportClick,
    onTopicNewClick,
    onBookImportClick,
  } = props;
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  const confirm = useConfirm();
  const {
    data: previewTopic,
    dispatch: setPreviewTopic,
    ...dialogProps
  } = useDialogProps<TopicSchema>();
  const handleTopicClick = (topic: TopicSchema) => setPreviewTopic(topic);
  const handleDeleteButtonClick = async () => {
    if (!book) return;
    await confirm({
      title: `ブック「${book.name}」を削除します。よろしいですか？`,
      cancellationText: "キャンセル",
      confirmationText: "OK",
    });
    onDelete(book);
  };
  const handleSectionNewClick = () => {
    // TODO: window.prompt は非推奨な API なのでやめたい
    const name = window.prompt("新しいセクション名を入力してください。");
    if (name) onAddSection({ name, topics: [] });
  };

  return (
    <Container
      classes={containerClasses}
      className={classes.container}
      maxWidth="md"
    >
      <Typography className={classes.title} variant="h4">
        ブックの編集
        <Typography variant="caption" component="span" aria-hidden="true">
          <RequiredDot />
          は必須項目です
        </Typography>
      </Typography>
      <BookEditChildren
        className={classes.children}
        sections={book?.sections ?? []}
        onTopicClick={handleTopicClick}
        onTopicImportClick={onTopicImportClick}
        onTopicNewClick={onTopicNewClick}
        onBookImportClick={onBookImportClick}
        onSectionNewClick={handleSectionNewClick}
      />
      <BookForm className={classes.form} book={book} onSubmit={onSubmit} />
      <Button size="small" color="primary" onClick={handleDeleteButtonClick}>
        <DeleteOutlined />
        ブックを削除
      </Button>
      {previewTopic && (
        <TopicPreviewDialog {...dialogProps} topic={previewTopic} />
      )}
    </Container>
  );
}
