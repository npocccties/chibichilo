import type { Story } from "@storybook/react";
import Books from "./Books";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import AppBar from "$organisms/AppBar";
import { book, books, session } from "samples";

export default {
  title: "templates/Books",
  parameters: { layout: "fullscreen" },
  component: Books,
};

const linkedBook = { ...book, editable: true };

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

const Template: Story<Parameters<typeof Books>[0]> = (args) => (
  <>
    <SlideAppBar />
    <Books {...args} />
  </>
);

export const Default = Template.bind({});
Default.args = {
  linkedBook,
  totalCount: 123,
  contents: books.map((book) => ({ type: "book", ...book })),
};

export const Empty = Template.bind({});
Empty.args = {
  totalCount: 0,
  contents: [],
};
