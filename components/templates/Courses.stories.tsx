import type { Story } from "@storybook/react";
import Courses from "./Courses";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import AppBar from "$organisms/AppBar";
import { ltiResourceLink, book, session } from "$samples";

export default {
  title: "templates/Courses",
  parameters: { layout: "fullscreen" },
  component: Courses,
};

const appBarHandlers = {
  onBooksClick: console.log,
  onTopicsClick: console.log,
  onCoursesClick: console.log,
  onDashboardClick: console.log,
};

const contents = [
  {
    type: "link",
    oauthClientId: ltiResourceLink.consumerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    ltiContext: {
      id: ltiResourceLink.contextId,
      label: ltiResourceLink.contextLabel,
      title: ltiResourceLink.contextTitle,
    },
    ltiResourceLink: { id: ltiResourceLink.id, title: ltiResourceLink.title },
    book,
  },
];

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

const Template: Story<Parameters<typeof Courses>[0]> = (args) => (
  <>
    <SlideAppBar />
    <Courses {...args} />
  </>
);

export const Default = Template.bind({});
Default.args = {
  clientIds: ["test"],
  contents,
};

export const Empty = Template.bind({});
Empty.args = {
  clientIds: [],
  contents: [],
};
