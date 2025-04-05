import { useMemo } from "react";
import type { TopicSchema } from "$server/models/topic";
import { useTheme } from "@mui/material/styles";
import Video from "$organisms/Video";
import useSticky from "$utils/useSticky";
import { isVideoResource } from "$utils/videoResource";
import { gray } from "$theme/colors";
import type { ActivitySchema } from "$server/models/activity";
import { useLoggerInit } from "$utils/eventLogger/logger";

type Props = {
  topic: TopicSchema;
  bookActivity?: ActivitySchema[];
  onEnded?: () => void;
  offset?: string;
  isPrivateBook?: boolean;
  isBookPage?: boolean;
};

export default function TopicViewerContent({
  topic,
  bookActivity,
  onEnded,
  offset,
  isPrivateBook = false,
  isBookPage = false,
}: Props) {
  const theme = useTheme();
  const sticky = useSticky({
    offset: offset ?? theme.spacing(-2),
    backgroundColor: gray[800],
  });
  const timeRange = useMemo(() => {
    if (!bookActivity) {
      return [];
    }
    const activity = bookActivity.find(
      (activity) => activity.topic.id === topic.id
    );
    if (!activity) {
      return [];
    }
    return activity.timeRanges;
  }, [bookActivity, topic.id]);

  useLoggerInit(topic.id);

  return (
    <>
      {isVideoResource(topic.resource) && (
        <Video
          className={sticky}
          // NOTE:親要素の領域幅いっぱいに表示するため、マイナスマージンを設定している
          sx={{ mx: -3 }}
          topic={topic}
          timeRange={timeRange}
          onEnded={onEnded}
          isPrivateBook={isPrivateBook}
          isBookPage={isBookPage}
        />
      )}
    </>
  );
}
