export default { title: "templates/TopicImport" };

import TopicImport from "./TopicImport";
import { topic } from "samples";

const handleTopicDetailClick = console.log;

const topics = [...Array(10)].map(() => topic);

export const Default = () => (
  <TopicImport topics={topics} onTopicDetailClick={handleTopicDetailClick} />
);

export const Empty = () => (
  <TopicImport topics={[]} onTopicDetailClick={handleTopicDetailClick} />
);
