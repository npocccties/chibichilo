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
  onBookLinkClick() {
    console.log("onBookLinkClick");
  },
};

export const Default = () => <Books {...props} />;

export const Empty = () => (
  <Books {...props} books={[]} ltiResourceLink={null} />
);
