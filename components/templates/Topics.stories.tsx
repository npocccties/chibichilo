export default { title: "templates/Topics" };

import Topics from "./Topics";
import { topic } from "samples";

const topics = [...Array(10)].map(() => topic);
const handlers = {
  onTopicEditClick: console.log,
};

export const Default = () => <Topics topics={topics} {...handlers} />;

export const Empty = () => <Topics topics={[]} {...handlers} />;
