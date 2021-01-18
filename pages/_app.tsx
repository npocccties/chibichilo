import type { ReactNode } from "react";
import { Provider } from "jotai";
import type { AppProps } from "next/app";
import Head from "next/head";
import MuiThemeProvider from "@material-ui/styles/ThemeProvider";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ConfirmProvider } from "material-ui-confirm";
import theme from "$theme";
import AppBar from "$organisms/AppBar";
import { useRouter } from "next/router";
import { useSession } from "$utils/session";
// NOTE: For VideoJs components.
import "video.js/dist/video-js.css";
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";
import "$styles/video-js.css";

function ThemeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();
  const handleBooksClick = () => router.push("/books");
  const handleDashboardClick = () => undefined;
  return (
    <>
      <Head>
        <title>ChibiCHiLO</title>
        <meta name="viewport" content="width=device-width" />
        <meta name="theme-color" content={theme.palette.primary.main} />
      </Head>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar
          position="sticky"
          session={session.data || {}}
          onBooksClick={handleBooksClick}
          onDashboardClick={handleDashboardClick}
        />
        {children}
      </MuiThemeProvider>
    </>
  );
}

function App({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <ThemeProvider>
        <ConfirmProvider>
          <Component {...pageProps} />
        </ConfirmProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
