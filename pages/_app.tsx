import type { ReactNode } from "react";
import { Provider } from "jotai";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { ConfirmProvider } from "material-ui-confirm";
import theme from "$theme";
import Placeholder from "$templates/Placeholder";
import AppBar from "$organisms/AppBar";
import Problem from "$organisms/Problem";
import EmbedProblem from "$templates/EmbedProblem";
import {
  NEXT_PUBLIC_NO_EMBED,
  NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK,
} from "$utils/env";
import inIframe from "$utils/inIframe";
import { useSessionInit } from "$utils/session";
import { pagesPath } from "$utils/$path";
// NOTE: For VideoJs components.
import "video.js/dist/video-js.css";
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";

function Content({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, isInstructor, error } = useSessionInit();
  const trigger = useScrollTrigger();

  if (session?.user?.id === 0 && router.pathname === "/book") {
    return <>{children}</>;
  }
  if (error || session?.user?.id === 0) {
    return (
      <Problem title="セッション情報が得られませんでした">
        LTIリンクからアクセスしてください
      </Problem>
    );
  }
  if (!session) return <Placeholder />;
  const isDeepLink = session?.ltiDlSettings?.deep_link_return_url !== undefined;
  if (!isDeepLink && NEXT_PUBLIC_NO_EMBED && inIframe()) {
    return <EmbedProblem />;
  }

  const handleBooksClick = () => router.push(pagesPath.books.$url());
  const handleTopicsClick = () => router.push(pagesPath.topics.$url());
  const handleCoursesClick = () => router.push(pagesPath.courses.$url());
  const handleDashboardClick = () => router.push(pagesPath.dashboard.$url());
  const handleBookClick = () => router.push(pagesPath.$url());
  const handleBookmarksClick = () => router.push(pagesPath.bookmarks.$url());
  const handleDownloadClick = () => router.push(pagesPath.download.$url());

  return (
    <>
      {NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK && (
        <Slide appear={false} direction="down" in={!trigger}>
          <AppBar
            isInstructor={isInstructor}
            position="sticky"
            session={session}
            onBooksClick={handleBooksClick}
            onTopicsClick={handleTopicsClick}
            onCoursesClick={handleCoursesClick}
            onDashboardClick={handleDashboardClick}
            onBookClick={handleBookClick}
            onBookmarksClick={handleBookmarksClick}
            onDownloadClick={handleDownloadClick}
          />
        </Slide>
      )}
      {children}
    </>
  );
}

function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <title>CHiBi-CHiLO</title>
        <meta name="viewport" content="width=device-width" />
        <meta name="theme-color" content={theme.palette.primary.main} />
      </Head>
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Content>{children}</Content>
        </MuiThemeProvider>
      </StyledEngineProvider>
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
