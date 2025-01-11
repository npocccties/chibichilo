import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
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
import useReleaseBooks from "$utils/useReleaseBooks";
import ReleaseItemList from "$organisms/ReleaseItemList";
import MetainfoForm from "$organisms/MetainfoForm";

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
  onItemEditClick,
  onClone,
  onMetainfoUpdate,
}: Props) {
  const { session } = useSessionAtom();
  const classes = useStyles();
  const confirm = useConfirm();
  const {
    data: previewTopic,
    dispatch: setPreviewTopic,
    ...dialogProps
  } = useDialogProps<TopicSchema>();
  const { releases, error: _ } = useReleaseBooks(book.id);
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
  const handleCloneButtonClick = async () => {
    await confirm({
      title: `ブック「${book.name}」を複製します。よろしいですか？`,
      cancellationText: "キャンセル",
      confirmationText: "OK",
    });
    onClone(book);
  };
  if (!book.release) return <Placeholder />;
  const handleItemEditClick = async (index: number) => {
    const id = releases?.[index]?.id;
    if (id) onItemEditClick(id);
  };
  const editable = isContentEditable?.(book);

  return (
    <Container className={classes.container} maxWidth="md">
      <BackButton onClick={onCancel}>戻る</BackButton>
      <Typography className={classes.title} variant="h4">
        ブック「{book.name}」の編集
      </Typography>
      <Typography className={classes.subtitle} variant="h5">
        リリース
      </Typography>
      <ReleaseForm
        release={book.release}
        onSubmit={editable ? onReleaseUpdate : undefined}
      />
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
        variant={editable ? "update" : "other"}
        onSubmit={onSubmit}
        onAuthorsUpdate={onAuthorsUpdate}
        onAuthorSubmit={onAuthorSubmit}
      />
      <Typography className={classes.subtitle} variant="h5">
        メタ情報
      </Typography>
      <MetainfoForm metainfo={book} onSubmit={onMetainfoUpdate} />
      {releases && (
        <>
          <Typography className={classes.subtitle} variant="h5">
            リリース一覧
          </Typography>
          <ReleaseItemList
            releases={releases}
            onItemEditClick={handleItemEditClick}
          />
        </>
      )}
      <Button size="small" color="primary" onClick={handleCloneButtonClick}>
        <PeopleOutlinedIcon />
        ブックを複製
      </Button>
      {editable && (
        <Button size="small" color="primary" onClick={handleDeleteButtonClick}>
          <DeleteOutlinedIcon />
          ブックを削除
        </Button>
      )}
      {previewTopic && (
        <TopicPreviewDialog {...dialogProps} topic={previewTopic} />
      )}
    </Container>
  );
}
