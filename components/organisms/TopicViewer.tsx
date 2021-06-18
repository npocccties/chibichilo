import clsx from "clsx";
import { TopicSchema } from "$server/models/topic";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui/core/styles";
import TopicViewerContent from "$molecules/TopicViewerContent";
import useCardStyles from "styles/card";

const useStyles = makeStyles({
  root: {
    overflow: "visible",
  },
});

type Props = {
  className?: string;
  topic: TopicSchema;
  onEnded?: () => void;
  offset?: number;
  minimize?: boolean;
};

export default function TopicViewer({ className, ...others }: Props) {
  const classes = useStyles();
  const cardClasses = useCardStyles();
  return (
    <Card classes={cardClasses} className={clsx(classes.root, className)}>
      <TopicViewerContent {...others} />
    </Card>
  );
}
