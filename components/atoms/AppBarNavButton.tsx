import type { ComponentProps, ReactNode } from "react";
import Button from "@mui/material/Button";

type Props = ComponentProps<typeof Button> & {
  icon: ReactNode;
  label: string;
};

export default function AppBarNavButton(props: Props) {
  const { icon, label, ...others } = props;
  return (
    <Button sx={{ flexDirection: "column", lineHeight: 1.5 }} {...others}>
      {icon}
      <span style={{ fontSize: "0.75rem" }}>{label}</span>
    </Button>
  );
}
