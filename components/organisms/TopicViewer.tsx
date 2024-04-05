import clsx from "clsx";
import type { TopicSchema } from "$server/models/topic";
import Card from "@mui/material/Card";
import makeStyles from "@mui/styles/makeStyles";
import TopicViewerContent from "$organisms/TopicViewerContent";
import useCardStyles from "$styles/card";
import type { ActivitySchema } from "$server/models/activity";

const useStyles = makeStyles({
  root: {
    overflow: "visible",
  },
});

type Props = {
  className?: string;
  topic: TopicSchema;
  bookActivity?: ActivitySchema[];
  onEnded?: () => void;
  offset?: string;
  isPrivateBook?: boolean;
  isBookPage?: boolean;
};

export default function TopicViewer({
  className,
  topic,
  bookActivity,
  onEnded,
  offset,
  isPrivateBook = false,
  isBookPage = false,
}: Props) {
  const classes = useStyles();
  const cardClasses = useCardStyles();
  return (
    <Card classes={cardClasses} className={clsx(classes.root, className)}>
      <TopicViewerContent
        topic={topic}
        bookActivity={bookActivity}
        onEnded={onEnded}
        offset={offset}
        isPrivateBook={isPrivateBook}
        isBookPage={isBookPage}
      />
    </Card>
  );
}
