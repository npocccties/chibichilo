import type { ComponentProps, ReactNode } from "react";
import Button from "@mui/material/Button";

const MUI_TAB_INDICATOR_THICKNESS = 2;

type Props = ComponentProps<typeof Button> & {
  icon: ReactNode;
  label: string;
  active?: boolean;
};

export default function AppBarNavButton(props: Props) {
  const { icon, label, active, ...others } = props;
  return (
    <Button
      sx={[
        { flexDirection: "column", lineHeight: 1.5 },
        active && {
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: MUI_TAB_INDICATOR_THICKNESS,
            backgroundColor: (theme) => theme.palette.primary.main,
            borderRadius: 0,
          },
        },
      ]}
      {...others}
    >
      {icon}
      <span style={{ fontSize: "0.75rem" }}>{label}</span>
    </Button>
  );
}
