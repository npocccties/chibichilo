import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
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
import ReleaseForm from "$organisms/ReleaseForm";
import MetainfoForm from "$organisms/MetainfoForm";
import type { MetainfoProps } from "$server/models/metainfo";

const containerSx: SxProps<Theme> = {
  mt: 1,
  "& > :not(.topic-edit-title):not(.topic-edit-content)": {
    mb: 2,
  },
};

const titleSx: SxProps<Theme> = {
  mb: 4,
  "& span": {
    verticalAlign: "middle",
  },
  "& .RequiredDot": {
    mr: 0.5,
    mb: 0.75,
    ml: 2,
  },
};

const formSx: SxProps<Theme> = {
  mb: 2,
};

const subtitleSx: SxProps<Theme> = {
  "& span": {
    verticalAlign: "middle",
  },
  "& .RequiredDot": {
    mr: 0.5,
    mb: 0.75,
    ml: 2,
  },
};

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
  onItemEditClick(id: TopicSchema["id"]): void;
  onMetainfoUpdate(metainfo: MetainfoProps): void;
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
    onItemEditClick,
    onMetainfoUpdate,
  } = props;
  const confirm = useConfirm();
  const { releases, error: _ } = useReleaseTopics(topic.id);
  const handleDeleteButtonClick = async () => {
    const { confirmed } = await confirm({
      title: `トピック「${topic.name}」を削除します。よろしいですか？`,
      cancellationText: "キャンセル",
      confirmationText: "OK",
    });
    if (!confirmed) return;
    onDelete(topic);
  };
  const handleItemEditClick = async (index: number) => {
    const id = releases?.[index]?.id;
    if (id) onItemEditClick(id);
  };
  const release = getReleaseFromRelatedBooks(topic.relatedBooks);

  return (
    <Container sx={containerSx} maxWidth="md">
      <BackButton onClick={onCancel}>戻る</BackButton>
      {release && (
        <Typography className="topic-edit-title" sx={titleSx} variant="h4">
          トピックの表示
        </Typography>
      )}
      {!release && (
        <Typography className="topic-edit-title" sx={titleSx} variant="h4">
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
      {release && <ReleaseForm release={release} />}
      <Typography sx={subtitleSx} variant="h5">
        基本情報
      </Typography>
      <Box className="topic-edit-content" sx={formSx}>
        <TopicForm
          topic={topic}
          submitResult={submitResult}
          variant="update"
          onSubmit={onSubmit}
          onSubtitleDelete={onSubtitleDelete}
          onSubtitleSubmit={onSubtitleSubmit}
          onAuthorsUpdate={onAuthorsUpdate}
          onAuthorSubmit={onAuthorSubmit}
        />
      </Box>
      <Typography sx={subtitleSx} variant="h5">
        メタ情報
      </Typography>
      <MetainfoForm metainfo={topic} onSubmit={onMetainfoUpdate} />
      {releases && (
        <>
          <Typography sx={subtitleSx} variant="h5">
            リリース一覧
          </Typography>
          <ReleaseItemList
            id={topic.id}
            releases={releases}
            variant="topic"
            onItemEditClick={handleItemEditClick}
          />
        </>
      )}
      {!release && (
        <Button size="small" color="primary" onClick={handleDeleteButtonClick}>
          <DeleteOutlinedIcon />
          トピックを削除
        </Button>
      )}
    </Container>
  );
}
