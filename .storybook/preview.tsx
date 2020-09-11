import * as nextRouter from "next/router";
import { addDecorator } from "@storybook/react";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from "material-ui-snackbar-provider";
import { StateProvider } from "../components/state";
import { theme } from "../components/theme";
// NOTE: For VideoJs components.
import "video.js/dist/video-js.css";
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";

// NOTE: Mock useRouter
// @ts-ignore
nextRouter.useRouter = () => ({ route: "/", query: {} });

addDecorator((story) => (
  <StateProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfirmProvider>
        <SnackbarProvider SnackbarProps={{ autoHideDuration: 5e3 }}>
          <Container>{story()}</Container>
        </SnackbarProvider>
      </ConfirmProvider>
    </ThemeProvider>
  </StateProvider>
));
