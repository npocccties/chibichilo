import { styled } from "@mui/material/styles";
import MuiChip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import type { SxProps } from "@mui/system";
import type { KeywordPropSchema } from "$server/models/keyword";

type Props = {
  keyword: KeywordPropSchema;
  onKeywordClick?(keyword: KeywordPropSchema): void;
  sx?: SxProps;
  onDelete?: () => void;
  disabled?: boolean;
};

const Chip = styled(MuiChip)({
  borderRadius: 4,
  maxWidth: "100%",
});

export default function KeywordChip({
  keyword,
  onKeywordClick,
  sx,
  onDelete,
  disabled = false,
}: Props) {
  const handleClick = () => onKeywordClick?.(keyword);
  return (
    <Tooltip title={keyword.name} disableInteractive>
      <Chip
        sx={sx}
        variant="outlined"
        size="small"
        color="primary"
        label={keyword.name}
        onClick={onKeywordClick && handleClick}
        onDelete={onDelete}
        disabled={disabled}
      />
    </Tooltip>
  );
}
