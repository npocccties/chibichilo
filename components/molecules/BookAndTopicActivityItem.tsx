import { useState } from "react";
import { Box, Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import clsx from "clsx";
import makeStyles from "@mui/styles/makeStyles";
import useCardStyles from "$styles/card";
import { gray } from "$theme/colors";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { ActivityRewatchRateProps } from "$server/validators/activityRewatchRate";
import { round } from "$server/utils/math";

import VideoResource from "$organisms/Video/VideoResource";
import type { VideoResourceSchema } from "$server/models/videoResource";
import useSticky from "$utils/useSticky";
import { useTopic } from "$utils/topic";
import { useTheme } from "@mui/material/styles";

import ActivityRewatchGraph from "$components/organisms/ActivityRewatchGraph";

import { NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD } from "$utils/env";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 4,
    display: "flex",
    alignItems: "center",
  },
  row: {
    width: "100%",
  },
  name: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    color: gray[700],
    marginRight: theme.spacing(1),
  },
  topic: {
    flex: 1,
    display: "flex",
    color: gray[700],
  },
  titleColumn: {
    width: "70%",
    alignItems: "center",
  },
  column: {
    display: "flex",
    width: "10%",
    alignItems: "center",
    justifyContent: "center",
  },
}));

type BookAndTopicProps = {
  scope: boolean;
  book: Pick<BookSchema, "id" | "name"> & {
    activitiesByTopics: Array<
      Pick<TopicSchema, "id" | "name" | "timeRequired"> & {
        averageCompleteRate: number;
      }
    >;
  };
  rewatchRates: Array<ActivityRewatchRateProps>;
};

type TopicProps = {
  scope: boolean;
  topic: Pick<TopicSchema, "id" | "name" | "timeRequired"> & {
    averageCompleteRate: number;
  };
  averageRewatchRate: number;
};

function getAverageRewatchRate(
  rewatchRates: Array<ActivityRewatchRateProps>,
  topicId: number
) {
  const topicRewatchRates =
    rewatchRates.filter((r) => topicId === r.topicId) ?? [];

  const averageRewatchRate =
    topicRewatchRates
      ?.map((r: ActivityRewatchRateProps) => r.rewatchRate ?? 0)
      .reduce((a, b) => {
        return a + b;
      }, 0) / topicRewatchRates.length ?? 0;

  return round(averageRewatchRate || 0, -3);
}

export default function BookAndTopicActivityItem(props: BookAndTopicProps) {
  const { scope, book, rewatchRates } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <h4>{book.name}</h4>
        {book.activitiesByTopics.map((topic, index) => (
          <TopicActivityItem
            key={index}
            scope={scope}
            topic={topic}
            averageRewatchRate={
              NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD
                ? getAverageRewatchRate(rewatchRates, topic.id)
                : 0
            }
          />
        ))}
      </div>
    </div>
  );
}

export function TopicActivityViewer(
  props: Pick<TopicProps, "scope" | "topic">
) {
  const [open, setOpen] = useState(false);
  const cardClasses = useCardStyles();
  const theme = useTheme();
  const sticky = useSticky({
    offset: theme.spacing(-2),
    backgroundColor: gray[800],
  });

  const { scope, topic } = props;
  const topic_detail = useTopic(topic.id);

  return (
    <Box
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: "2",
        WebkitBoxOrient: "vertical",
      }}
    >
      <Button variant="text" onClick={() => setOpen(true)}>
        {topic.name}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ classes: cardClasses }}
        fullWidth
      >
        {topic_detail === undefined ? (
          <div
            style={{
              width: "80%",
              height: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <p>Loading...</p>
          </div>
        ) : (
          <Box sx={{ margin: "0 32px" }}>
            <h2>{topic.name}</h2>
            <Box>
              <VideoResource
                className={sticky}
                sx={{ mx: -3 }}
                {...(topic_detail.resource as VideoResourceSchema)}
                identifier={String(topic_detail.id)}
              />
            </Box>
            <Box>
              <ActivityRewatchGraph
                scope={scope}
                topicId={topic.id}
                topicTimeRequired={topic_detail.timeRequired}
                topicStartTime={topic_detail.startTime}
                topicStopTime={topic_detail.stopTime}
              />
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}

export function TopicActivityItem(props: TopicProps) {
  const { scope, topic, averageRewatchRate } = props;
  const classes = useStyles();

  return (
    <div className={classes.topic}>
      <div className={clsx(classes.name, classes.titleColumn)}>
        <TopicActivityViewer scope={scope} topic={topic} />
      </div>
      <div className={clsx(classes.column)}>{topic.timeRequired}</div>
      <div className={clsx(classes.column)}>{topic.averageCompleteRate}</div>
      {NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD ? (
        <div className={clsx(classes.column)}>{averageRewatchRate}</div>
      ) : (
        <></>
      )}
    </div>
  );
}
