export default {
  title: "templates/BookNew",
  parameters: { layout: "fullscreen" },
};

import BookNew from "./BookNew";
import { book } from "$samples";

const onSubmit = console.log;
const onCancel = () => console.log("back");
const defaultProps = { onSubmit, onCancel };

export const Default = () => <BookNew {...defaultProps} />;

export const Fork = () => <BookNew book={book} {...defaultProps} />;
