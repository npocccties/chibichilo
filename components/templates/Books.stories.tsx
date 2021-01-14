export default { title: "templates/Books" };

import Books from "./Books";
import { books } from "samples";

const props = {
  books,
  ltiResourceLink: {
    id: "1",
    title: "リンク1",
    contextId: "2",
    contextTitle: "コース2",
  },
  onBookClick: console.log,
  onBookEditClick: console.log,
  onBookNewClick() {
    console.log("onBookNewClick");
  },
};

export const Default = () => <Books {...props} />;

export const Empty = () => (
  <Books
    books={[]}
    onBookClick={props.onBookClick}
    onBookEditClick={props.onBookEditClick}
    onBookNewClick={props.onBookNewClick}
  />
);
