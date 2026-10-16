import Box from "@mui/material/Box";
import { learningStatus } from "$theme/colors";
import label from "$utils/learningStatusLabel";
import type { LearningStatus } from "$server/models/learningStatus";
import rewatchLabel from "$utils/rewatchLabel";
import { grey } from "@mui/material/colors";

const statusSx = {
  completed: {
    backgroundColor: learningStatus["completed"],
    color: learningStatus["unopened"],
  },
  incompleted: {
    backgroundColor: learningStatus["incompleted"],
    color: learningStatus["completed"],
  },
  unopened: {
    backgroundColor: learningStatus["unopened"],
    // NOTE: ページ背景色とのコントラストが十分でないので枠線で視認性を向上する
    border: "1px solid",
    borderColor: grey[400],
  },
};

const sizeSx = {
  default: { width: 12, height: 12 },
  large: { width: 16, height: 16 },
};

const rewatchSx = {
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  "&::before": {
    content: `'${rewatchLabel}'`,
    fontSize: 15,
    lineHeight: "15px",
    fontWeight: 900, // Black (Heavy)
  },
};

type Props = {
  status: LearningStatus;
  size?: "default" | "large";
  isRewatched?: "default" | "rewatch";
};

export default function LearningStatusDot(props: Props) {
  const { status, size = "default", isRewatched = "default" } = props;

  return (
    <Box
      role="img"
      aria-label={label[status]}
      sx={[
        { display: "block", borderRadius: "4px" },
        statusSx[status],
        sizeSx[size],
        isRewatched === "rewatch" ? rewatchSx : {},
      ]}
    />
  );
}
