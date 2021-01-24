export default { title: "templates/BookImport" };

import BookImport from "./BookImport";
import { books } from "samples";

export const Default = () => (
  <BookImport
    books={books}
    onBookEditClick={console.log}
    onTopicClick={console.log}
    onTreeChange={console.log}
  />
);

export const Empty = () => (
  <BookImport
    books={[]}
    onBookEditClick={console.log}
    onTopicClick={console.log}
  />
);
