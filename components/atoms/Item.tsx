import type { ElementType } from "react";
import Typography from "@mui/material/Typography";
import gray from "theme/colors/gray";

type Props = {
  itemKey: string;
  value: string;
  component?: ElementType;
};

export default function Item(props: Props) {
  const { itemKey, value, component = "span" } = props;
  return (
    <Typography
      sx={{ color: gray[700] }}
      variant="caption"
      component={component}
    >
      {itemKey}: {value}
    </Typography>
  );
}
