import type { ReactNode } from "react";
import type { Preview } from "@storybook/react";
import { Provider } from "jotai";
import {
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ConfirmProvider } from "material-ui-confirm";
import theme from "../theme";
// NOTE: For VideoJs components.
import "video.js/dist/video-js.css";
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";

function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
}

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Provider>
        <ThemeProvider>
          <ConfirmProvider>
            <Story />
          </ConfirmProvider>
        </ThemeProvider>
      </Provider>
    ),
  ],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
  },
};

export default preview;
