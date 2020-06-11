import { ThemeProvider } from "@material-ui/styles";
import { Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import MenuIcon from "@material-ui/icons/Menu";
import { ReactNode, useMemo } from "react";
import { usePopupState, bindTrigger } from "material-ui-popup-state/hooks";
import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from "material-ui-snackbar-provider";
import Head from "next/head";
import { TopAppMenu } from "./TopAppMenu";
import { useAppState } from "./state";
import { useShowRegistContents } from "./api";
import { theme } from "./theme";
import { useLmsSession, isLmsInstructor } from "./session";

function Title(props: { children: ReactNode }) {
  return <Typography component="h1" variant="h6" color="inherit" {...props} />;
}

const TopAppBar = (props: { title: string }) => {
  useShowRegistContents();
  const popupState = usePopupState({
    variant: "popover",
    popupId: "TopAppMenu",
  });

  return (
    <AppBar>
      <Toolbar>
        <Button
          startIcon={<MenuIcon />}
          color="inherit"
          size="large"
          style={{ marginRight: 24 }}
          {...bindTrigger(popupState)}
        >
          メニュー
        </Button>
        <TopAppMenu popupState={popupState} />
        <Box flexGrow={1} component={Title} children={props.title} />
      </Toolbar>
    </AppBar>
  );
};

export const AppThemeProvider = (props: { children: ReactNode }) => {
  const session = useLmsSession();
  const isInstructor = useMemo(() => isLmsInstructor(session), [session]);
  const prefersDarkMode = true; // TODO: useMediaQuery("(prefers-color-scheme: dark)");
  const appTheme = useMemo<Theme>(
    () => ({
      ...theme,
      palette: {
        ...theme.palette,
        type: prefersDarkMode ? "dark" : "light",
      },
    }),
    [prefersDarkMode]
  );
  const title = useAppState().title;
  return (
    <ThemeProvider theme={appTheme}>
      <Head>
        <title>{title}</title>
      </Head>
      <CssBaseline />
      <ConfirmProvider>
        <SnackbarProvider SnackbarProps={{ autoHideDuration: 5e3 }}>
          {isInstructor && <TopAppBar title={title} />}
          <Box pt={isInstructor ? 12 : 0} component={Container}>
            {props.children}
          </Box>
        </SnackbarProvider>
      </ConfirmProvider>
    </ThemeProvider>
  );
};
