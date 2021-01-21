export default { title: "molecules/BookTree" };

import BookTree from "./BookTree";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { book } from "$samples";

const props = {
  book,
  onItemClick: console.log,
};

export const Default = () => (
  <TreeView
    defaultCollapseIcon={<ExpandMoreIcon />}
    defaultExpandIcon={<ChevronRightIcon />}
  >
    <BookTree {...props} />
  </TreeView>
);

export const Editable = () => (
  <TreeView
    defaultCollapseIcon={<ExpandMoreIcon />}
    defaultExpandIcon={<ChevronRightIcon />}
  >
    <BookTree
      {...props}
      onItemEditClick={console.log}
      onBookEditClick={console.log}
    />
  </TreeView>
);
