import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SectionsEdit from "$organisms/SectionsEdit";
import BookForm from "$organisms/BookForm";
import TopicPreviewDialog from "$organisms/TopicPreviewDialog";
import Container from "$atoms/Container";
import BackButton from "$atoms/BackButton";
import type { TopicSchema } from "$server/models/topic";
import { useConfirm } from "material-ui-confirm";
import { useSessionAtom } from "$store/session";
import useDialogProps from "$utils/useDialogProps";
import ReleaseForm from "$organisms/ReleaseForm";
import Placeholder from "./Placeholder";
import { useStyles, type Props } from "./BookEdit";

export default function BookEditReleased({
  book,
  onSubmit,
  onDelete,
  onCancel,
  onSectionsUpdate,
  onTopicImportClick,
  onTopicNewClick,
  onTopicEditClick,
  onBookImportClick,
  onAuthorsUpdate,
  onAuthorSubmit,
  isContentEditable,
  linked = false,
  onReleaseUpdate,
}: Props) {
  const { session } = useSessionAtom();
  const classes = useStyles();
  const confirm = useConfirm();
  const {
    data: previewTopic,
    dispatch: setPreviewTopic,
    ...dialogProps
  } = useDialogProps<TopicSchema>();
  const handleTopicPreviewClick = (topic: TopicSchema) =>
    setPreviewTopic(topic);
  const handleDeleteButtonClick = async () => {
    await confirm({
      title: `ブック「${book.name}」を削除します。よろしいですか？`,
      cancellationText: "キャンセル",
      confirmationText: "OK",
    });
    onDelete(book);
  };
  if (!book.release) return <Placeholder />;

  return (
    <Container className={classes.container} maxWidth="md">
      <BackButton onClick={onCancel}>戻る</BackButton>
      <Typography className={classes.title} variant="h4">
        ブック「{book.name}」の編集
      </Typography>
      <Typography className={classes.subtitle} variant="h5">
        リリース
      </Typography>
      <ReleaseForm release={book.release} onSubmit={onReleaseUpdate} />
      <Typography className={classes.subtitle} variant="h5">
        トピック
      </Typography>
      <SectionsEdit
        className={classes.content}
        sections={book.sections}
        onTopicPreviewClick={handleTopicPreviewClick}
        onTopicEditClick={onTopicEditClick}
        onTopicImportClick={onTopicImportClick}
        onTopicNewClick={onTopicNewClick}
        onBookImportClick={onBookImportClick}
        onSectionsUpdate={onSectionsUpdate}
        isContentEditable={isContentEditable}
        noedit={true}
      />
      <Typography className={classes.subtitle} variant="h5">
        基本情報
      </Typography>
      <BookForm
        className={classes.content}
        book={book}
        linked={linked}
        hasLtiTargetLinkUri={Boolean(session?.ltiTargetLinkUri)}
        variant="update"
        onSubmit={onSubmit}
        onAuthorsUpdate={onAuthorsUpdate}
        onAuthorSubmit={onAuthorSubmit}
      />
      <Button size="small" color="primary" onClick={handleDeleteButtonClick}>
        <DeleteOutlinedIcon />
        ブックを削除
      </Button>
      {previewTopic && (
        <TopicPreviewDialog {...dialogProps} topic={previewTopic} />
      )}
    </Container>
  );
}