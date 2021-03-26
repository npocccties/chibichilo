import type { ReactNode } from "react";
import type { Story } from "@storybook/react";
import { Provider } from "jotai";
import MuiThemeProvider from "@material-ui/styles/ThemeProvider";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ConfirmProvider } from "material-ui-confirm";
import theme from "../theme";
// NOTE: For VideoJs components.
import "video.js/dist/video-js.css";
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";
import "../styles/video-js.css";

function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export const decorators = [
  (Story: Story) => (
    <Provider>
      <ThemeProvider>
        <ConfirmProvider>
          <Story />
        </ConfirmProvider>
      </ThemeProvider>
    </Provider>
  ),
];
