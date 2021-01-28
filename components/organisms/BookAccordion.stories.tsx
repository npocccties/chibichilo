export default { title: "organisms/BookAccordion" };

import BookAccordion from "./BookAccordion";
import { book } from "samples";

const props = { book, onEditClick: console.log, onTopicClick: console.log };

export const Default = () => (
  <div>
    {[...Array(10)].map((_value, index) => (
      <BookAccordion key={index} {...props} />
    ))}
  </div>
);

export const Editable = () => (
  <div>
    {[...Array(10)].map((_value, index) => (
      <BookAccordion
        key={index}
        {...props}
        onTopicEditClick={console.log}
        isTopicEditable={() => true}
      />
    ))}
  </div>
);
