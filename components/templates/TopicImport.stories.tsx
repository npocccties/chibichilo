export default { title: "templates/TopicImport" };

import TopicImport from "./TopicImport";
import { topic } from "samples";

const topics = [...Array(10)].map(() => topic);
const handlers = {
  onSubmit: console.log,
  onTopicEditClick: console.log,
};

export const Default = () => <TopicImport topics={topics} {...handlers} />;

export const Empty = () => <TopicImport topics={[]} {...handlers} />;
