export default { title: "organisms/BookEditChildren" };

import BookEditChildren from "./BookEditChildren";
import { sections } from "samples";

const handleTopicClick = console.log;
const handleTopicEditClick = console.log;

export const Default = () => (
  <BookEditChildren sections={sections} onTopicClick={handleTopicClick} />
);

export const Editable = () => (
  <BookEditChildren
    sections={sections}
    onTopicClick={handleTopicClick}
    onTopicEditClick={handleTopicEditClick}
    isTopicEditable={() => true}
  />
);
