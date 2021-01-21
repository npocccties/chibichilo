export default { title: "organisms/BookChildren" };

import BookChildren from "./BookChildren";
import { sections } from "samples";

const props = {
  sections,
  onItemClick(_: never, index: ItemIndex) {
    console.log(index);
  },
};

export const Default = () => <BookChildren {...props} />;

export const Editable = () => (
  <BookChildren {...props} onItemEditClick={console.log} />
);
