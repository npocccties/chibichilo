export default { title: "templates/BookImport" };

import BookImport from "./BookImport";
import { books } from "samples";

const handlers = {
  onBookEditClick: console.log,
  onTopicClick: console.log,
  onTopicEditClick: console.log,
  onSubmit: console.log,
};

export const Default = () => <BookImport books={books} {...handlers} />;

export const Empty = () => <BookImport books={[]} {...handlers} />;
