import { createMuiTheme } from "@material-ui/core/styles";
import { blue, deepOrange } from "@material-ui/core/colors";

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: blue[800],
    },
    secondary: {
      main: deepOrange[500],
    },
    type: "dark",
  },
  typography: {
    fontFamily: "sans-serif",
  },
});
