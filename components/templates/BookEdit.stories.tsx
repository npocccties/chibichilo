export default { title: "templates/BookEdit" };

import BookEdit from "./BookEdit";
import { book } from "samples";

const handleSubmit = console.log;
const handleDelete = console.log;
const handleAddSection = console.log;
const handleTopicImportClick = () => console.log("onTopicImportClick");
const handleTopicNewClick = () => console.log("onTopicNewClick");
const handleBookImportClick = () => console.log("onBookImportClick");
const handleTopicEditClick = console.log;
const handlers = {
  onSubmit: handleSubmit,
  onDelete: handleDelete,
  onAddSection: handleAddSection,
  onTopicImportClick: handleTopicImportClick,
  onTopicNewClick: handleTopicNewClick,
  onTopicEditClick: handleTopicEditClick,
  onBookImportClick: handleBookImportClick,
  isTopicEditable: () => true,
};

export const Default = () => <BookEdit book={book} {...handlers} />;

export const Empty = () => <BookEdit book={null} {...handlers} />;
