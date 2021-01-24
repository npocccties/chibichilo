export default { title: "molecules/BookChildrenTree" };

import BookChildrenTree from "./BookChildrenTree";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { sections } from "$samples";

const props = {
  sections,
  onItemClick: console.log,
};

export const Default = () => (
  <TreeView
    defaultCollapseIcon={<ExpandMoreIcon />}
    defaultExpandIcon={<ChevronRightIcon />}
  >
    <BookChildrenTree {...props} />
  </TreeView>
);

export const Editable = () => (
  <TreeView
    defaultCollapseIcon={<ExpandMoreIcon />}
    defaultExpandIcon={<ChevronRightIcon />}
  >
    <BookChildrenTree {...props} onItemEditClick={console.log} />
  </TreeView>
);

export const Selectable = () => (
  <TreeView
    defaultCollapseIcon={<ExpandMoreIcon />}
    defaultExpandIcon={<ChevronRightIcon />}
  >
    <BookChildrenTree {...props} onTreeChange={console.log} />
  </TreeView>
);
