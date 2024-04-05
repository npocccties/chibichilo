export default {
  title: "templates/BookImport",
  parameters: { layout: "fullscreen" },
};

import BookImport from "./BookImport";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import AppBar from "$organisms/AppBar";
import { books, session } from "samples";

const appBarHandlers = {
  onBooksClick: console.log,
  onTopicsClick: console.log,
  onDashboardClick: console.log,
};

const handlers = {
  onBookEditClick: console.log,
  onTopicClick: console.log,
  onTopicEditClick: console.log,
  onSubmit: console.log,
  onCancel: () => console.log("Cancel"),
};

function SlideAppBar() {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar
        position="sticky"
        session={session}
        {...appBarHandlers}
        isInstructor={false}
      />
    </Slide>
  );
}

export const Default = () => (
  <>
    <SlideAppBar />
    <BookImport
      totalCount={123}
      contents={books.map((book) => ({ type: "book", ...book }))}
      {...handlers}
    />
  </>
);

export const Empty = () => (
  <>
    <SlideAppBar />
    <BookImport totalCount={0} contents={[]} {...handlers} />
  </>
);
