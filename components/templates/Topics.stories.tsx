export default {
  title: "templates/Topics",
  parameters: { layout: "fullscreen" },
};

import Topics from "./Topics";
import Slide from "@material-ui/core/Slide";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import AppBar from "$organisms/AppBar";
import { topic, session } from "$samples";

const appBarHandlers = {
  onBooksClick: console.log,
  onTopicsClick: console.log,
  onDashboardClick: console.log,
};

const topics = [...Array(10)].map(() => topic);

const handlers = {
  onTopicEditClick: console.log,
  onTopicNewClick: console.log,
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
    <Topics topics={topics} {...handlers} />
  </>
);

export const Empty = () => (
  <>
    <SlideAppBar />
    <Topics topics={[]} {...handlers} />
  </>
);
