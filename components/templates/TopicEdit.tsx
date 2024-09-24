import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import makeStyles from "@mui/styles/makeStyles";
import TopicForm from "$organisms/TopicForm";
import Container from "$atoms/Container";
import RequiredDot from "$atoms/RequiredDot";
import BackButton from "$atoms/BackButton";
import type { TopicProps, TopicSchema } from "$server/models/topic";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import type { AuthorSchema } from "$server/models/author";
import { useConfirm } from "material-ui-confirm";
import AddIcon from "@mui/icons-material/Add";
import { getReleaseFromRelatedBooks } from "$utils/release";
import useReleaseTopics from "$utils/useReleaseTopics";
import ReleaseItemList from "$organisms/ReleaseItemList";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(1),
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
  form: {
    marginBottom: theme.spacing(2),
  },
}));

type Props = {
  topic: TopicSchema;
  submitResult: string;
  onSubmit(topic: TopicProps): void;
  onDelete(topic: TopicSchema): void;
  onCancel(): void;
  onSubtitleDelete(videoTrack: VideoTrackSchema): void;
  onSubtitleSubmit(videoTrack: VideoTrackProps): void;
  onAuthorsUpdate(authors: AuthorSchema[]): void;
  onAuthorSubmit(author: Pick<AuthorSchema, "email">): void;
  onImportClick(): void;
};

export default function TopicEdit(props: Props) {
  const {
    topic,
    submitResult,
    onSubmit,
    onDelete,
    onCancel,
    onSubtitleDelete,
    onSubtitleSubmit,
    onAuthorsUpdate,
    onAuthorSubmit,
    onImportClick,
  } = props;
  const classes = useStyles();
  const confirm = useConfirm();
  const { releases, error: _ } = useReleaseTopics(topic.id);
  const handleDeleteButtonClick = async () => {
    await confirm({
      title: `トピック「${topic.name}」を削除します。よろしいですか？`,
      cancellationText: "キャンセル",
      confirmationText: "OK",
    });
    onDelete(topic);
  };
  const released = Boolean(getReleaseFromRelatedBooks(topic.relatedBooks));

  return (
    <Container className={classes.container} maxWidth="md">
      <BackButton onClick={onCancel}>戻る</BackButton>
      {released && (
        <Typography className={classes.title} variant="h4">
          トピックの表示
        </Typography>
      )}
      {!released && (
        <Typography className={classes.title} variant="h4">
          トピックの編集
          <Button size="small" color="primary" onClick={onImportClick}>
            <AddIcon sx={{ mr: 0.5 }} />
            上書きインポート
          </Button>
          <Typography variant="caption" component="span" aria-hidden="true">
            <RequiredDot />
            は必須項目です
          </Typography>
        </Typography>
      )}
      <TopicForm
        className={classes.form}
        topic={topic}
        submitResult={submitResult}
        variant="update"
        onSubmit={onSubmit}
        onSubtitleDelete={onSubtitleDelete}
        onSubtitleSubmit={onSubtitleSubmit}
        onAuthorsUpdate={onAuthorsUpdate}
        onAuthorSubmit={onAuthorSubmit}
      />
      {releases && (
        <>
          <Typography className={classes.title} variant="h5">
            リリース一覧
          </Typography>
          <ReleaseItemList releases={releases} />
        </>
      )}
      <Button size="small" color="primary" onClick={handleDeleteButtonClick}>
        <DeleteOutlinedIcon />
        トピックを削除
      </Button>
    </Container>
  );
}
