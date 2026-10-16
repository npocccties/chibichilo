import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import LearningStatusDot from "$atoms/LearningStatusDot";
import getLocaleEntries from "$utils/bookLearningActivity/getLocaleEntries";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { SessionSchema } from "$server/models/session";
import type { ActivityRewatchRateProps } from "$server/validators/activityRewatchRate";

import { NEXT_PUBLIC_ACTIVITY_REWATCH_RATE_THRESHOLD } from "$utils/env";
import { NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD } from "$utils/env";

const buttonSx: SxProps<Theme> = {
  appearance: "none",
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
};
const descriptionListSx: SxProps<Theme> = {
  "& > div": {
    display: "flex",
    flexWrap: "wrap",
    my: 0.5,
  },
  "& dt, & dd": {
    margin: 0,
  },
};

type Props = {
  activity: BookActivitySchema;
  onActivityClick?(activity: BookActivitySchema): void;
  session: SessionSchema;
  rewatchRate: ActivityRewatchRateProps | undefined;
};

function isRewatched(rewatchRate: number) {
  return rewatchRate >= NEXT_PUBLIC_ACTIVITY_REWATCH_RATE_THRESHOLD;
}

export default function LearnerActivityDot(props: Props) {
  const { activity, onActivityClick, session, rewatchRate } = props;
  const handleActivityClick = () => onActivityClick?.(activity);
  const items = Object.entries(
    getLocaleEntries(activity, rewatchRate, session)
  );

  const rewatchLabel =
    NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD &&
    isRewatched(rewatchRate?.rewatchRate ?? 0)
      ? "rewatch"
      : "default";

  return (
    <Tooltip
      title={
        <Box component="dl" sx={descriptionListSx}>
          {items.map(([key, value], index) => (
            <div key={index}>
              <dt>
                {key}
                <Box component="span" sx={{ mr: 0.5 }} aria-hidden>
                  :
                </Box>
              </dt>
              <dd>{key === "ユーザ名" && !value ? "名前未公開" : value}</dd>
            </div>
          ))}
        </Box>
      }
      arrow
    >
      <Box component="button" sx={buttonSx} onClick={handleActivityClick}>
        <LearningStatusDot
          status={activity.status}
          size="large"
          isRewatched={rewatchLabel}
        />
      </Box>
    </Tooltip>
  );
}
