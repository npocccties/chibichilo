export default {
  title: "templates/BookLink",
  parameters: { layout: "fullscreen" },
};

import BookLink from "./BookLink";
import Slide from "@material-ui/core/Slide";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import AppBar from "$organisms/AppBar";
import { books, session } from "samples";

const appBarHandlers = {
  onBooksClick: console.log,
  onTopicsClick: console.log,
  onDashboardClick: console.log,
};

const defaultProps = {
  books,
  ltiResourceLink: {
    id: "1",
    title: "提供1",
    contextId: "2",
    contextTitle: "コース2",
    contextLabel: "C2",
  },
  onSubmit: console.log,
  onCancel: () => console.log("Cancel"),
  onBookEditClick: console.log,
  onBookNewClick: console.log,
};

function SlideAppBar() {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar position="sticky" session={session} {...appBarHandlers} />
    </Slide>
  );
}

export const Default = () => (
  <>
    <SlideAppBar />
    <BookLink {...defaultProps} />
  </>
);

export const Empty = () => (
  <>
    <SlideAppBar />
    <BookLink {...defaultProps} books={[]} />
  </>
);
