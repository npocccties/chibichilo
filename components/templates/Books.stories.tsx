export default {
  title: "templates/Books",
  parameters: { layout: "fullscreen" },
};

import Books from "./Books";
import Slide from "@material-ui/core/Slide";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import AppBar from "$organisms/AppBar";
import { books, session } from "samples";

const appBarHandlers = {
  onBooksClick: console.log,
  onTopicsClick: console.log,
  onDashboardClick: console.log,
};

const handlers = {
  onBookClick: console.log,
  onBookEditClick: console.log,
  onBookNewClick() {
    console.log("onBookNewClick");
  },
  onBookLinkClick() {
    console.log("onBookLinkClick");
  },
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
    <Books books={books} {...handlers} />
  </>
);

export const Empty = () => (
  <>
    <SlideAppBar />
    <Books books={[]} {...handlers} />
  </>
);
