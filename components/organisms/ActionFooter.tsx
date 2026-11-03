import type { ComponentProps } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import type { SxProps, Theme } from "@mui/material/styles";
import { gray } from "theme/colors";

const appBarSx: SxProps<Theme> = {
  borderTop: `1px solid ${gray[400]}`,
  boxShadow: "none",
  backgroundColor: "#fff",
  top: "unset",
  bottom: 0,
};

type Props = ComponentProps<typeof AppBar> &
  Pick<ComponentProps<typeof Container>, "children" | "maxWidth">;

export default function ActionFooter(props: Props) {
  const { children, maxWidth, ...others } = props;
  return (
    <AppBar sx={appBarSx} position="fixed" color="default" {...others}>
      <Toolbar disableGutters>
        <Container
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
          maxWidth={maxWidth}
        >
          {children}
        </Container>
      </Toolbar>
    </AppBar>
  );
}
