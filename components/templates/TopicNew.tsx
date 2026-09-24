import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import type { SxProps, Theme } from "@mui/material/styles";
import TopicForm from "$organisms/TopicForm";
import Container from "$atoms/Container";
import RequiredDot from "$atoms/RequiredDot";
import BackButton from "$atoms/BackButton";
import type { TopicSchema } from "$server/models/topic";
import type { AuthorSchema } from "$server/models/author";
import type { TopicSubmitValues } from "$types/topicSubmitValues";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import { useSessionAtom } from "$store/session";

const containerSx: SxProps<Theme> = {
  mt: 1,
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

const alertSx: SxProps<Theme> = {
  mt: -2,
  mb: 2,
};

type Props = {
  topic?: TopicSchema;
  submitResult: string;
  onSubmit(topic: TopicSubmitValues): void;
  onSubtitleDelete(videoTrack: VideoTrackSchema): void;
  onSubtitleSubmit(videoTrack: VideoTrackProps): void;
  onCancel(): void;
  onAuthorsUpdate(authors: AuthorSchema[]): void;
  onAuthorSubmit(author: Pick<AuthorSchema, "email">): void;
};

export default function TopicNew({
  topic,
  submitResult,
  onSubmit,
  onSubtitleDelete,
  onSubtitleSubmit,
  onCancel,
  onAuthorsUpdate,
  onAuthorSubmit,
}: Props) {
  const { isContentEditable } = useSessionAtom();
  const forkFrom =
    topic &&
    !isContentEditable(topic) &&
    topic.authors.length > 0 &&
    topic.authors;
  const defaultTopic = topic && {
    ...topic,
    ...(forkFrom && { name: [topic.name, "フォーク"].join("_") }),
  };

  return (
    <Container sx={containerSx} maxWidth="md">
      <BackButton onClick={onCancel}>戻る</BackButton>
      <Typography sx={titleSx} variant="h4">
        トピックの作成
        <Typography variant="caption" component="span" aria-hidden="true">
          <RequiredDot />
          は必須項目です
        </Typography>
      </Typography>
      {forkFrom && (
        <Alert sx={alertSx} severity="info">
          {forkFrom.map(({ name }) => `${name} さん`).join("、")}
          のトピックをフォークしようとしています
        </Alert>
      )}
      <TopicForm
        topic={defaultTopic}
        submitResult={submitResult}
        variant="create"
        onSubmit={onSubmit}
        onSubtitleDelete={onSubtitleDelete}
        onSubtitleSubmit={onSubtitleSubmit}
        onAuthorsUpdate={onAuthorsUpdate}
        onAuthorSubmit={onAuthorSubmit}
      />
    </Container>
  );
}
