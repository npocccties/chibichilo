import type { Story } from "@storybook/react";
import Topics from "./Topics";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import AppBar from "$organisms/AppBar";
import { topic, session } from "$samples";

export default {
  title: "templates/Topics",
  parameters: { layout: "fullscreen" },
  component: Topics,
};

const appBarHandlers = {
  onBooksClick: console.log,
  onTopicsClick: console.log,
  onDashboardClick: console.log,
};

const contents = [...Array(10)].map(() => ({
  type: "topic" as const,
  ...topic,
}));

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

const Template: Story<Parameters<typeof Topics>[0]> = (args) => (
  <>
    <SlideAppBar />
    <Topics {...args} />
  </>
);

export const Default = Template.bind({});
Default.args = {
  totalCount: 123,
  contents,
};

export const Empty = Template.bind({});
Empty.args = {
  totalCount: 0,
  contents: [],
};
