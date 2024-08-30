import BookEditReleased from "./BookEditReleased";
import { book, release } from "samples";

export default {
  title: "templates/BookEditReleased",
  component: BookEditReleased,
  parameters: { layout: "fullscreen" },
};

const defaultProps = {
  book: { ...book, release },
  onSubmit: console.log,
  onDelete: console.log,
  onCancel: console.log,
  onSectionsUpdate: console.log,
  onTopicImportClick: console.log,
  onTopicNewClick: console.log,
  onTopicEditClick: console.log,
  onBookImportClick: console.log,
  onAuthorsUpdate: console.log,
  onAuthorSubmit: console.log,
  isContentEditable: () => false,
  onOverwriteClick: console.log,
};

export const Default = () => {
  return <BookEditReleased {...defaultProps} />;
};
