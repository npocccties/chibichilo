import { styled } from "@mui/material/styles";
import MuiChip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import type { SxProps } from "@mui/system";

type Props = {
  domain: string;
  onDomainClick?(domain: string): void;
  sx?: SxProps;
  onDelete?: () => void;
};

const Chip = styled(MuiChip)({
  borderRadius: "4px",
  maxWidth: "100%",
});

export default function DomainChip({
  domain,
  onDomainClick,
  sx,
  onDelete,
}: Props) {
  const handleClick = () => onDomainClick?.(domain);
  return (
    <Tooltip title={domain} disableInteractive>
      <Chip
        sx={sx}
        variant="outlined"
        size="small"
        color="primary"
        label={domain}
        onClick={onDomainClick && handleClick}
        onDelete={onDelete}
      />
    </Tooltip>
  );
}
