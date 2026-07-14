import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { paths } from "$utils/routes";
import { NEXT_PUBLIC_BASE_PATH } from "$utils/env";
import IndexPage from "$pages/index";
import BookPage from "$pages/book";
import BookNewPage from "$pages/book/new";
import BookEditPage from "$pages/book/edit";
import BookEditTopicPage from "$pages/book/edit/topic";
import BookEditTopicNewPage from "$pages/book/edit/topic/new";
import BookEditTopicEditPage from "$pages/book/edit/topic/edit";
import BookImportPage from "$pages/book/import";
import BookImportTopicPage from "$pages/book/import/topic";
import BookImportTopicEditPage from "$pages/book/import/topic/edit";
import BookTopicPage from "$pages/book/topic";
import BookTopicEditPage from "$pages/book/topic/edit";
import BookTopicImportPage from "$pages/book/topic/import";
import BookTopicImportEditPage from "$pages/book/topic/import/edit";
import BookReleasePage from "$pages/book/release";
import BookOverwritePage from "$pages/book/overwrite";
import BookLinkingPage from "$pages/book/linking";
import BooksPage from "$pages/books";
import BooksImportPage from "$pages/books/import";
import BooksTopicPage from "$pages/books/topic";
import BooksTopicEditPage from "$pages/books/topic/edit";
import TopicsPage from "$pages/topics";
import TopicsNewPage from "$pages/topics/new";
import TopicsEditPage from "$pages/topics/edit";
import TopicsImportPage from "$pages/topics/import";
import CoursesPage from "$pages/courses";
import DashboardPage from "$pages/dashboard";
import BookmarksPage from "$pages/bookmarks";
import DownloadPage from "$pages/download";
import UserSettingsPage from "$pages/userSettings";

export const router = createBrowserRouter(
  [
    {
      element: <App />,
      children: [
        { path: paths.index, element: <IndexPage /> },
        { path: paths.book, element: <BookPage /> },
        { path: paths.bookNew, element: <BookNewPage /> },
        { path: paths.bookEdit, element: <BookEditPage /> },
        { path: paths.bookEditTopic, element: <BookEditTopicPage /> },
        { path: paths.bookEditTopicNew, element: <BookEditTopicNewPage /> },
        { path: paths.bookEditTopicEdit, element: <BookEditTopicEditPage /> },
        { path: paths.bookImport, element: <BookImportPage /> },
        { path: paths.bookImportTopic, element: <BookImportTopicPage /> },
        {
          path: paths.bookImportTopicEdit,
          element: <BookImportTopicEditPage />,
        },
        { path: paths.bookTopic, element: <BookTopicPage /> },
        { path: paths.bookTopicEdit, element: <BookTopicEditPage /> },
        { path: paths.bookTopicImport, element: <BookTopicImportPage /> },
        {
          path: paths.bookTopicImportEdit,
          element: <BookTopicImportEditPage />,
        },
        { path: paths.bookRelease, element: <BookReleasePage /> },
        { path: paths.bookOverwrite, element: <BookOverwritePage /> },
        { path: paths.bookLinking, element: <BookLinkingPage /> },
        { path: paths.books, element: <BooksPage /> },
        { path: paths.booksImport, element: <BooksImportPage /> },
        { path: paths.booksTopic, element: <BooksTopicPage /> },
        { path: paths.booksTopicEdit, element: <BooksTopicEditPage /> },
        { path: paths.topics, element: <TopicsPage /> },
        { path: paths.topicsNew, element: <TopicsNewPage /> },
        { path: paths.topicsEdit, element: <TopicsEditPage /> },
        { path: paths.topicsImport, element: <TopicsImportPage /> },
        { path: paths.courses, element: <CoursesPage /> },
        { path: paths.dashboard, element: <DashboardPage /> },
        { path: paths.bookmarks, element: <BookmarksPage /> },
        { path: paths.download, element: <DownloadPage /> },
        { path: paths.userSettings, element: <UserSettingsPage /> },
      ],
    },
  ],
  { basename: NEXT_PUBLIC_BASE_PATH || undefined }
);
