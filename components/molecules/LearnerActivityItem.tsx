import { Fragment } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { common } from "@mui/material/colors";
import LearnerActivityDot from "$atoms/LearnerActivityDot";
import { gray } from "$theme/colors";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { LearnerSchema } from "$server/models/learner";
import type { SessionSchema } from "$server/models/session";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  name: {
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
  },
  dots: {
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    "& > *": {
      margin: theme.spacing(0, 0.5),
    },
  },
  separator: {
    borderRight: "1px solid",
    color: gray[200],
    height: 16,
    padding: 0,
  },
}));

type Props = {
  learner: LearnerSchema;
  activities: Array<BookActivitySchema>;
  onActivityClick?(activity: BookActivitySchema): void;
  session: SessionSchema;
};

export default function LearnerActivityItem(props: Props) {
  const { learner, activities, onActivityClick, session } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <span className={classes.name}>{learner.name || "名前未公開"}</span>
      <div className={classes.dots}>
        {activities.map((activity, index) => (
          <Fragment key={index}>
            <LearnerActivityDot
              activity={activity}
              onActivityClick={onActivityClick}
              session={session}
            />
            {activities[index + 1] &&
              activities[index + 1].book.id !== activity.book.id && (
                <div role="separator" className={classes.separator} />
              )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
