export default { title: "organisms/BookChildren" };

import BookChildren from "./BookChildren";
import { sections } from "samples";

const props = {
  sections,
  onItemClick(_: never, index: [number, number]) {
    console.log({ index });
  },
};

export const Default = () => <BookChildren {...props} />;

export const Editable = () => (
  <BookChildren {...props} onItemEditClick={console.log} />
);
