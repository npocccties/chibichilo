import { useEffect, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Provider } from "jotai";
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
import { bookUrl, paths } from "$utils/routes";
import { useAppRouter } from "$utils/useAppRouter";
import "video.js/dist/video-js.css";
import "videojs-seek-buttons/dist/videojs-seek-buttons.css";
import { useLtiContextAtom, useUpdateLtiContextAtom } from "$store/session";

function Content() {
  const router = useAppRouter();
  const { session, isInstructor, error } = useSessionInit();
  const { isLtiContextReady } = useLtiContextAtom();
  const [, setLtiContext] = useUpdateLtiContextAtom();
  const trigger = useScrollTrigger();

  useEffect(() => {
    if (session && !isLtiContextReady) {
      setLtiContext({
        ltiConsumerId: null,
        ltiContextId: null,
        pathname: null,
      });
    }
  }, [session, isLtiContextReady, setLtiContext]);

  const resetBookmarkAuth = () => {
    setLtiContext({
      ltiConsumerId: null,
      ltiContextId: null,
      pathname: null,
    });
  };
  const handleBooksClick = () => {
    resetBookmarkAuth();
    void router.push(paths.books);
  };
  const handleCoursesClick = () => {
    resetBookmarkAuth();
    void router.push(paths.courses);
  };
  const handleDashboardClick = () => {
    resetBookmarkAuth();
    void router.push(paths.dashboard);
  };
  const handleBookClick = () => {
    resetBookmarkAuth();
    const ltiResourceLink = session?.ltiResourceLink;
    if (!ltiResourceLink?.bookId) return;
    const query = ltiResourceLink.topicId
      ? { bookId: ltiResourceLink.bookId, topicId: ltiResourceLink.topicId }
      : { bookId: ltiResourceLink.bookId };
    void router.push(bookUrl(query));
  };
  const handleBookmarksClick = () => {
    resetBookmarkAuth();
    void router.push(paths.bookmarks);
  };
  const handleDownloadClick = () => {
    resetBookmarkAuth();
    void router.push(paths.download);
  };

  if (session?.user?.id === 0 && router.pathname === paths.book) {
    return <Outlet />;
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

  const handleTopicsClick = () => router.push(paths.topics);

  return (
    <>
      {(isInstructor || NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK) && (
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
      <Outlet />
    </>
  );
}

function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Helmet>
        <title>CHiBi-CHiLO</title>
        <meta name="viewport" content="width=device-width" />
        <meta name="theme-color" content={theme.palette.primary.main} />
      </Helmet>
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </StyledEngineProvider>
    </>
  );
}

export default function App() {
  return (
    <Provider>
      <ThemeProvider>
        <ConfirmProvider>
          <Content />
        </ConfirmProvider>
      </ThemeProvider>
    </Provider>
  );
}
