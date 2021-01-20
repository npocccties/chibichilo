import { TopicSchema } from "$server/models/topic";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { ja } from "date-fns/locale";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Video from "$organisms/Video";
import Item from "$atoms/Item";

function formatInterval(start: Date | number, end: Date | number) {
  const duration = intervalToDuration({ start, end });
  return formatDuration(duration, { locale: ja });
}

const useStyles = makeStyles((theme) => ({
  video: {
    position: "sticky",
    top: theme.spacing(-2),
    marginTop: theme.spacing(-2),
    marginRight: theme.spacing(-3),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(-3),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  items: {
    "& > *": {
      display: "inline-block",
      marginRight: theme.spacing(1.75),
      marginBottom: theme.spacing(1),
    },
  },
  description: {
    whiteSpace: "pre-wrap",
  },
}));

type Props = {
  topic: TopicSchema;
  onEnded?: () => void;
};

export default function TopicPlaer(props: Props) {
  const classes = useStyles();
  const { topic, onEnded } = props;
  return (
    <>
      {"providerUrl" in topic.resource && (
        <Video
          className={classes.video}
          {...topic.resource}
          onEnded={onEnded}
          autoplay
        />
      )}
      <Typography className={classes.title} variant="h5">
        {topic.name}
      </Typography>
      <div className={classes.items}>
        <Typography className={classes.title} variant="h6">
          学習時間 {formatInterval(0, topic.timeRequired * 1000) || "10秒未満"}
        </Typography>
        <Typography className={classes.title} variant="h6">
          日本語
        </Typography>
        <Typography className={classes.title} variant="h6">
          ライセンス
        </Typography>
      </div>
      <div className={classes.items}>
        <Item itemKey="作成日" value={format(topic.createdAt, "yyyy.MM.dd")} />
        <Item itemKey="更新日" value={format(topic.updatedAt, "yyyy.MM.dd")} />
        <Item itemKey="作成者" value={topic.creator.name} />
      </div>
      <p className={classes.description}>{topic.description}</p>
    </>
  );
}
