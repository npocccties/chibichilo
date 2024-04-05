import type { Story } from "@storybook/react";
import TopicImport from "./TopicImport";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import AppBar from "$organisms/AppBar";
import { topic, session } from "samples";

export default {
  title: "templates/TopicImport",
  parameters: { layout: "fullscreen" },
  component: TopicImport,
};

function SlideAppBar() {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <AppBar position="sticky" session={session} isInstructor={false} />
    </Slide>
  );
}

const Template: Story<Parameters<typeof TopicImport>[0]> = (args) => (
  <>
    <SlideAppBar />
    <TopicImport {...args} />
  </>
);

export const Default = Template.bind({});
Default.args = {
  totalCount: 123,
  contents: [...Array(10)].map(() => ({ type: "topic", ...topic })),
};

export const Empty = Template.bind({});
Empty.args = {
  totalCount: 0,
  contents: [],
};
