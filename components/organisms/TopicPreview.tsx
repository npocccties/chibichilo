import clsx from "clsx";
import { format } from "date-fns";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import { EditOutlined } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import Video from "$organisms/Video";
import Item from "$atoms/Item";
import useCardStyle from "styles/card";
import { TopicSchema } from "$server/models/topic";
import { primary, gray } from "theme/colors";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > :not(:last-child)": {
      marginBottom: theme.spacing(1),
    },
  },
  header: {
    display: "flex",
    margin: `0 ${theme.spacing(-2)}px`,
    height: "calc(1.125rem * 2 * 1.6)",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: "1.125rem",
    maxHeight: "calc(1.125rem * 2 * 1.6)",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
  },
  checkBox: {
    marginLeft: theme.spacing(0.5),
  },
  items: {
    "& > *": {
      display: "inline-block",
      marginRight: theme.spacing(1.75),
      marginBottom: theme.spacing(1),
    },
  },
  description: {
    color: gray[700],
    margin: 0,
    fontSize: "0.875rem",
    lineHeight: 1.43,
    maxHeight: "calc(0.875rem * 3 * 1.43)",
    overflow: "hidden",
  },
  selected: {
    backgroundColor: primary[50],
  },
}));

type Props = Parameters<typeof Checkbox>[0] & {
  topic: TopicSchema;
  onTopicDetailClick(topic: TopicSchema): void;
  onTopicEditClick(topic: TopicSchema): void;
};

export default function TopicPreview(props: Props) {
  const cardClasses = useCardStyle();
  const classes = useStyles();
  const {
    topic,
    onTopicDetailClick,
    onTopicEditClick,
    checked,
    ...checkboxProps
  } = props;
  const handle = (handler: (topic: TopicSchema) => void) => () => {
    handler(topic);
  };
  return (
    <Card
      classes={cardClasses}
      className={clsx(classes.root, { [classes.selected]: checked })}
    >
      <Typography variant="h6" className={classes.header}>
        <Checkbox
          id={`TopicPreview-topic:${topic.id}`}
          className={classes.checkBox}
          color="primary"
          checked={checked}
          {...checkboxProps}
        />
        <label htmlFor={`TopicPreview-topic:${topic.id}`}>{topic.name}</label>
        <IconButton color="primary" onClick={handle(onTopicEditClick)}>
          <EditOutlined />
        </IconButton>
      </Typography>
      {"providerUrl" in topic.resource && <Video {...topic.resource} />}
      <div className={classes.items}>
        <Item itemKey="作成日" value={format(topic.createdAt, "yyyy.MM.dd")} />
        <Item itemKey="更新日" value={format(topic.updatedAt, "yyyy.MM.dd")} />
        <Item itemKey="作成者" value={topic.creator.name} />
      </div>
      <p className={classes.description}>{topic.description}</p>
      <Button size="small" color="primary" onClick={handle(onTopicDetailClick)}>
        もっと詳しく...
      </Button>
    </Card>
  );
}
