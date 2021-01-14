export default { title: "templates/TopicImport" };

import TopicImport from "./TopicImport";
import { topic } from "samples";

const topics = [...Array(10)].map(() => topic);

export const Default = () => <TopicImport topics={topics} />;

export const Empty = () => <TopicImport topics={[]} />;
