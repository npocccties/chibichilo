export default {
  title: "templates/TopicImport",
  parameters: { layout: "fullscreen" },
};

import TopicImport from "./TopicImport";
import Slide from "@material-ui/core/Slide";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import AppBar from "$organisms/AppBar";
import { topic, session } from "samples";

const appBarHandlers = {
  onBooksClick: console.log,
  onTopicsClick: console.log,
  onDashboardClick: console.log,
};

const topics = [...Array(10)].map(() => topic);

const handlers = {
  onSubmit: console.log,
  onCancel: () => console.log("Cancel"),
  onTopicEditClick: console.log,
  isTopicEditable: () => true,
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
    <TopicImport topics={topics} {...handlers} />
  </>
);

export const Empty = () => (
  <>
    <SlideAppBar />
    <TopicImport topics={[]} {...handlers} />
  </>
);

export const Others = () => (
  <>
    <SlideAppBar />
    <TopicImport topics={topics} {...handlers} isTopicEditable={() => false} />
  </>
);
