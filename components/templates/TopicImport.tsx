import { FormEvent, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TopicPreview from "$organisms/TopicPreview";
import TopicPreviewDialog from "$organisms/TopicPreviewDialog";
import SortSelect from "$atoms/SortSelect";
import SearchTextField from "$atoms/SearchTextField";
import { TopicSchema } from "$server/models/topic";
import { gray } from "$theme/colors";
import useContainerStyles from "$styles/container";

const useStyles = makeStyles((theme) => ({
  line: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: theme.spacing(-2),
    "& > *": {
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  title: {
    marginBottom: theme.spacing(4),
    "& > *": {
      marginRight: theme.spacing(1),
    },
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: gray[50],
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  topics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 380px)",
    gap: `${theme.spacing(2)}px`,
  },
}));

type Props = {
  topics: TopicSchema[];
  onSubmit(topics: TopicSchema[]): void;
  onTopicEditClick(topic: TopicSchema): void;
  isTopicEditable(topic: TopicSchema): boolean | undefined;
};

export default function TopicImport(props: Props) {
  const { topics, onSubmit, onTopicEditClick, isTopicEditable } = props;
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  const [selectedIndexes, select] = useState<Set<number>>(new Set());
  const handleChecked = (index: number) => () =>
    select((indexes) =>
      indexes.delete(index) ? new Set(indexes) : new Set(indexes.add(index))
    );
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit([...selectedIndexes].map((i) => topics[i]));
  };
  const [previewTopic, setPreviewTopic] = useState<TopicSchema | null>(null);
  const handlePreviewTopicClose = () => setPreviewTopic(null);
  const handleTopicDetailClick = (topic: TopicSchema) => setPreviewTopic(topic);
  const handleTopicEditClick = (topic: TopicSchema) =>
    isTopicEditable(topic) && (() => onTopicEditClick(topic));
  return (
    <Container classes={containerClasses} maxWidth="lg">
      <form className={classes.header} onSubmit={handleSubmit}>
        <Typography className={classes.title} variant="h4" gutterBottom={true}>
          トピックのインポート
          <Typography variant="body1">
            インポートしたいトピックを選んでください
          </Typography>
        </Typography>
        <div className={classes.line}>
          <Button
            color="primary"
            size="large"
            variant="contained"
            type="submit"
          >
            トピックをインポート
          </Button>
          <SortSelect />
          <SearchTextField placeholder="トピック検索" />
        </div>
      </form>
      <div className={classes.topics}>
        {topics.map((topic, index) => (
          <TopicPreview
            key={index}
            topic={topic}
            checked={selectedIndexes.has(index)}
            onChange={handleChecked(index)}
            onTopicDetailClick={handleTopicDetailClick}
            onTopicEditClick={handleTopicEditClick(topic)}
          />
        ))}
      </div>
      {previewTopic && (
        <TopicPreviewDialog
          open
          onClose={handlePreviewTopicClose}
          topic={previewTopic}
        />
      )}
    </Container>
  );
}
