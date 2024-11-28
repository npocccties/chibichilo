import type { SxProps } from "@mui/system";
import Tooltip from "@mui/material/Tooltip";
import PeopleIcon from "@mui/icons-material/People";
import { gray } from "$theme/colors";

type Props = {
  className?: string;
  sx?: SxProps;
};

export default function SharedIndicator(props: Props) {
  const { className, sx } = props;
  return (
    <Tooltip title="教員に共有しています">
      <PeopleIcon
        className={className}
        sx={sx}
        fontSize="small"
        htmlColor={gray[700]}
      />
    </Tooltip>
  );
}
