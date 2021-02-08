export default { title: "templates/BookLink" };

import BookLink from "./BookLink";
import { books } from "samples";

const props = {
  books,
  ltiResourceLink: {
    id: "1",
    title: "リンク1",
    contextId: "2",
    contextTitle: "コース2",
    contextLabel: "C2",
  },
  onSubmit: console.log,
  onBookEditClick: console.log,
  onBookNewClick: console.log,
};

export const Default = () => <BookLink {...props} />;

export const Empty = () => <BookLink {...props} books={[]} />;
