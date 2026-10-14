import type { MouseEvent } from "react";
import { useCallback } from "react";
import type { SxProps } from "@mui/system";
import { styled } from "@mui/material/styles";
import MuiChip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";

const Chip = styled(MuiChip)({
  maxWidth: "100%",
});

type Props = {
  ltiResourceLink: LtiResourceLinkSchema;
  onLtiResourceLinkClick?(ltiResourceLink: LtiResourceLinkSchema): void;
  sx?: SxProps;
  onDelete?: () => void;
  allowViewing?: boolean;
};

export default function CourseChip({
  ltiResourceLink,
  onLtiResourceLinkClick,
  sx,
  onDelete,
  allowViewing = true,
}: Props) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      onLtiResourceLinkClick?.(ltiResourceLink);
    },
    [ltiResourceLink, onLtiResourceLinkClick]
  );
  const tooltipTitle = allowViewing
    ? ltiResourceLink.contextTitle
    : `${ltiResourceLink.contextTitle} (配信停止中)`;

  return (
    <Tooltip title={tooltipTitle} disableInteractive>
      <Chip
        sx={sx}
        aria-haspopup="true"
        variant="outlined"
        size="small"
        color={allowViewing ? "primary" : "default"}
        label={ltiResourceLink.contextLabel}
        onClick={onLtiResourceLinkClick && handleClick}
        onDelete={onDelete}
        icon={
          !allowViewing ? <VisibilityOffIcon fontSize="small" /> : undefined
        }
      />
    </Tooltip>
  );
}
