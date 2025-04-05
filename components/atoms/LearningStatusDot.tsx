import clsx from "clsx";
import makeStyles from "@mui/styles/makeStyles";
import { learningStatus } from "$theme/colors";
import label from "$utils/learningStatusLabel";
import type { LearningStatus } from "$server/models/learningStatus";
import { grey } from "@mui/material/colors";

const useStyles = makeStyles({
  root: {
    display: "block",
    borderRadius: 4,
    "&$completed": {
      backgroundColor: learningStatus["completed"],
      color: learningStatus["unopened"],
    },
    "&$incompleted": {
      backgroundColor: learningStatus["incompleted"],
      color: learningStatus["completed"],
    },
    "&$unopened": {
      backgroundColor: learningStatus["unopened"],
      // NOTE: ページ背景色とのコントラストが十分でないので枠線で視認性を向上する
      border: "1px solid",
      borderColor: grey[400],
    },
    "&$default": {
      width: 12,
      height: 12,
    },
    "&$large": {
      width: 16,
      height: 16,
    },
  },
  completed: {},
  incompleted: {},
  unopened: {},
  default: {},
  large: {},
  rewatch: {
    display: "grid",
    alignItems: "center",
    justifyContent: "center",
    "&::before": {
      content: "'↻'",
      fontSize: 14,
      fontWeight: "bold",
    },
  },
});

type Props = {
  status: LearningStatus;
  size?: "default" | "large";
  isRewatched?: "default" | "rewatch";
};

export default function LearningStatusDot(props: Props) {
  const { status, size = "default", isRewatched = "default" } = props;

  const classes = useStyles();

  return (
    <span
      role="img"
      aria-label={label[status]}
      className={clsx(
        classes.root,
        classes[status],
        classes[size],
        classes[isRewatched]
      )}
    />
  );
}
