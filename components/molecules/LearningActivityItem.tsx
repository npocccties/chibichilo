import clsx from "clsx";
import makeStyles from "@mui/styles/makeStyles";
import LearningStatusLabels from "$molecules/LearningStatusLabels";
import { learningStatus, gray } from "$theme/colors";
import useLineClampStyles from "$styles/lineClamp";
import type { BookSchema } from "$server/models/book";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { LearnerSchema } from "$server/models/learner";

type LearningBargraphProps = {
  className?: string;
  totalLearnerCount: number;
  completedCount: number;
  incompletedCount: number;
};

function LearningBargraph(props: LearningBargraphProps) {
  const { className, totalLearnerCount, completedCount, incompletedCount } =
    props;
  const unopenedCount = totalLearnerCount - completedCount - incompletedCount;
  const getPercentage = (value: number): string =>
    `${(value / totalLearnerCount) * 100}%`;
  return (
    <svg className={className} viewBox="0 0 200 10">
      <rect
        x="0"
        y="0"
        width={getPercentage(completedCount)}
        height="100%"
        fill={learningStatus["completed"]}
      />
      <rect
        x={getPercentage(completedCount)}
        y="0"
        width={getPercentage(incompletedCount)}
        height="100%"
        fill={learningStatus["incompleted"]}
      />
      <rect
        x={getPercentage(completedCount + incompletedCount)}
        y="0"
        width={getPercentage(unopenedCount)}
        height="100%"
        fill={learningStatus["unopened"]}
      />
    </svg>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  name: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    color: gray[700],
    marginRight: theme.spacing(1),
  },
  graph: {
    maxWidth: 400,
    width: "50%",
    "& > svg": {
      width: "100%",
      marginBottom: theme.spacing(1),
    },
  },
}));

type Props = {
  book: Pick<BookSchema, "id" | "name">;
  learners: Array<LearnerSchema>;
  completedLearners: Map<LearnerSchema["id"], Array<BookActivitySchema>>;
  incompletedLearners: Map<LearnerSchema["id"], Array<BookActivitySchema>>;
  onLearnerClick?(learner: LearnerSchema): void;
};

export default function LearningActivityItem(props: Props) {
  const {
    book,
    learners,
    completedLearners,
    incompletedLearners,
    onLearnerClick,
  } = props;
  const totalLearnerCount = learners.length;
  const completedCount = completedLearners.size;
  const incompletedCount = incompletedLearners.size;
  const classes = useStyles();
  const lineClamp = useLineClampStyles({
    fontSize: "1rem",
    lineClamp: 2,
    lineHeight: 1.375,
  });

  return (
    <div className={classes.root}>
      <div className={clsx(classes.name, lineClamp.placeholder)}>
        <span className={lineClamp.clamp}>{book.name}</span>
      </div>
      <div className={classes.graph}>
        <LearningBargraph
          totalLearnerCount={totalLearnerCount}
          completedCount={completedCount}
          incompletedCount={incompletedCount}
        />
        <LearningStatusLabels
          learners={learners}
          completedLearners={[...completedLearners.values()].map(
            ([{ learner }]) => learner
          )}
          incompletedLearners={[...incompletedLearners.values()].map(
            ([{ learner }]) => learner
          )}
          onLearnerClick={onLearnerClick}
        />
      </div>
    </div>
  );
}
