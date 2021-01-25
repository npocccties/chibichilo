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
  onTopicEditClick(topic: TopicSchema): void;
};

export default function Topics(props: Props) {
  const { topics, onTopicEditClick } = props;
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  const [previewTopic, setPreviewTopic] = useState<TopicSchema | null>(null);
  const handlePreviewTopicClose = () => setPreviewTopic(null);
  const handleTopicDetailClick = (topic: TopicSchema) => setPreviewTopic(topic);
  return (
    <Container classes={containerClasses} maxWidth="lg">
      <div className={classes.header}>
        <Typography className={classes.title} variant="h4" gutterBottom={true}>
          マイトピック
        </Typography>
        <div className={classes.line}>
          <SortSelect />
          <SearchTextField placeholder="トピック検索" />
        </div>
      </div>
      <div className={classes.topics}>
        {topics.map((topic, index) => (
          <TopicPreview
            key={index}
            topic={topic}
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
