import ForkRightOutlinedIcon from "@mui/icons-material/ForkRightOutlined";
import IconButton, { type IconButtonProps } from "$atoms/IconButton";

type Props = Omit<IconButtonProps, "tooltipProps">;

export default function ForkButton(props: Props) {
  return (
    <IconButton
      tooltipProps={{ title: "フォーク" }}
      color="primary"
      size="small"
      {...props}
    >
      <ForkRightOutlinedIcon />
    </IconButton>
  );
}
