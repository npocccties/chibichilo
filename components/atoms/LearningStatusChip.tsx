import Chip from "@mui/material/Chip";
import type { ChipProps } from "@mui/material/Chip";
import { learningStatus } from "$theme/colors";
import label from "$utils/learningStatusLabel";
import type { LearningStatus } from "$server/models/learningStatus";

type Props<Element extends React.ElementType> = ChipProps<
  Element,
  {
    type: LearningStatus;
  }
>;

export default function LearningStatusChip<Element extends React.ElementType>(
  props: Props<Element>
) {
  const { type, ...other } = props;
  return (
    <Chip
      sx={(theme) => ({
        backgroundColor: learningStatus[type],
        color: theme.palette.getContrastText(learningStatus[type]),
      })}
      label={label[type]}
      {...other}
    />
  );
}
