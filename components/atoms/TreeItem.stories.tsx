export default { title: "atoms/TreeItem" };

import TreeItem from "./TreeItem";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

export const Default = () => (
  <SimpleTreeView
    slots={{ collapseIcon: ExpandMoreIcon, expandIcon: ChevronRightIcon }}
  >
    <TreeItem
      itemId="0"
      label={
        <>
          コンピュータ・サイエンス
          <IconButton size="small" color="primary">
            <EditOutlinedIcon />
          </IconButton>
        </>
      }
    >
      <TreeItem itemId="1" label="1 情報のデジタルコンテンツ化">
        <TreeItem itemId="1.1" label="1.1 リンゴに夢中のレッサーパンダ" />
        <TreeItem itemId="1.2" label="1.2 やんちゃ盛り…1年前の円実" />
      </TreeItem>
      <TreeItem itemId="2" label="2 デジタルとアナログの相違点" />
    </TreeItem>
  </SimpleTreeView>
);
