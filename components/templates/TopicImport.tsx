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
  onSubmit(topics: Array<TopicSchema["id"]>): void;
  onTopicEditClick(topic: TopicSchema): void;
};

export default function TopicImport(props: Props) {
  const { topics, onSubmit, onTopicEditClick } = props;
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  const [selectedTopics, selectTopics] = useState<Set<TopicSchema["id"]>>(
    new Set()
  );
  const handleChecked = (id: TopicSchema["id"]) => () =>
    selectTopics((ids) =>
      ids.delete(id) ? new Set(ids) : new Set(ids.add(id))
    );
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit([...selectedTopics]);
  };
  const [previewTopic, setPreviewTopic] = useState<TopicSchema | null>(null);
  const handlePreviewTopicClose = () => setPreviewTopic(null);
  const handleTopicDetailClick = (topic: TopicSchema) => setPreviewTopic(topic);
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
            checked={selectedTopics.has(topic.id)}
            onChange={handleChecked(topic.id)}
            onTopicDetailClick={handleTopicDetailClick}
            onTopicEditClick={onTopicEditClick}
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
