import type { ComponentProps } from "react";
import { TreeItem as MuiTreeItem } from "@mui/x-tree-view/TreeItem";

type Props = ComponentProps<typeof MuiTreeItem>;

export default function TreeItem(props: Props) {
  return <MuiTreeItem {...props} />;
}
