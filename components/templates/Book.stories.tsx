export default {
  title: "templates/Book",
  parameters: { layout: "fullscreen" },
};

import { useEffect } from "react";
import { useBookAtom } from "$store/book";
import Book from "./Book";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import AppBar from "$organisms/AppBar";
import { book, session } from "$samples";
import { useUpdateSessionAtom } from "$store/session";

const defaultProps = {
  book,
  editable: true,
  onBookEditClick: console.log,
  onOtherBookLinkClick: console.log,
  onTopicEditClick: console.log,
};

const appBarHandlers = {
  onBooksClick: console.log,
  onTopicsClick: console.log,
  onDashboardClick: console.log,
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

export const Default = () => {
  const { itemIndex, updateItemIndex } = useBookAtom(defaultProps.book);

  return (
    <Book
      {...defaultProps}
      index={itemIndex}
      onTopicEnded={updateItemIndex}
      onItemClick={updateItemIndex}
    />
  );
};

export const Empty = () => {
  const { itemIndex, updateItemIndex } = useBookAtom();

  return (
    <>
      <SlideAppBar />
      <Book
        {...defaultProps}
        book={null}
        index={itemIndex}
        onTopicEnded={updateItemIndex}
        onItemClick={updateItemIndex}
      />
    </>
  );
};

export const EmptySection = () => {
  const { itemIndex, updateItemIndex } = useBookAtom();

  return (
    <>
      <SlideAppBar />
      <Book
        {...defaultProps}
        book={{ ...defaultProps.book, sections: [] }}
        index={itemIndex}
        onTopicEnded={updateItemIndex}
        onItemClick={updateItemIndex}
      />
    </>
  );
};

export const ForInstructor = () => {
  const { itemIndex, updateItemIndex } = useBookAtom(defaultProps.book);
  const [, updateSession] = useUpdateSessionAtom();
  useEffect(() => {
    updateSession({ session, error: false });
  }, [updateSession]);

  return (
    <>
      <SlideAppBar />
      <Book
        {...defaultProps}
        index={itemIndex}
        onTopicEnded={updateItemIndex}
        onItemClick={updateItemIndex}
      />
    </>
  );
};
