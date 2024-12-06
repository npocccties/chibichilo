import BookEdit from "./BookEdit";
import { book } from "samples";

export default {
  title: "templates/BookEdit",
  component: BookEdit,
  parameters: { layout: "fullscreen" },
};

const defaultProps = {
  book: { ...book },
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
  onReleaseUpdate: console.log,
  onRelease: console.log,
  onItemEditClick: console.log,
  onClone: console.log,
};

export const Default = () => {
  return <BookEdit {...defaultProps} />;
};
