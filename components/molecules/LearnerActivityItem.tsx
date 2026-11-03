import { Fragment } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { common } from "@mui/material/colors";
import LearnerActivityDot from "$atoms/LearnerActivityDot";
import { gray } from "$theme/colors";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { LearnerSchema } from "$server/models/learner";
import type { SessionSchema } from "$server/models/session";
import type { ActivityRewatchRateProps } from "$server/validators/activityRewatchRate";

const rootSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
};

const nameSx: SxProps<Theme> = {
  flexShrink: 0,
  color: gray[700],
  fontSize: "1rem",
  width: "10rem",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  marginRight: "1rem",
  position: "sticky",
  left: 0,
  backgroundColor: common.white,
  borderRight: `1px solid ${gray[200]}`,
};

const dotsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  whiteSpace: "nowrap",
  "& > *": {
    mx: 0.5,
  },
};

const separatorSx: SxProps<Theme> = {
  borderRight: "1px solid",
  color: gray[200],
  height: 16,
  padding: 0,
};

type Props = {
  learner: LearnerSchema;
  activities: Array<BookActivitySchema>;
  onActivityClick?(activity: BookActivitySchema): void;
  session: SessionSchema;
  rewatchRates: Array<ActivityRewatchRateProps>;
};

export default function LearnerActivityItem(props: Props) {
  const { learner, activities, onActivityClick, session, rewatchRates } = props;

  return (
    <Box component="div" sx={rootSx}>
      <Box component="span" sx={nameSx}>
        {learner.name || "名前未公開"}
      </Box>
      <Box component="div" sx={dotsSx}>
        {activities.map((activity, index) => (
          <Fragment key={index}>
            <LearnerActivityDot
              activity={activity}
              onActivityClick={onActivityClick}
              session={session}
              rewatchRate={rewatchRates.find(
                (r) =>
                  (r.learnerId === activity.learner.id &&
                    r.topicId === activity.topic.id &&
                    r.bookId === activity.bookId) ??
                  0
              )}
            />
            {activities[index + 1] &&
              activities[index + 1].book.id !== activity.book.id && (
                <Box component="div" role="separator" sx={separatorSx} />
              )}
          </Fragment>
        ))}
      </Box>
    </Box>
  );
}
