import Typography from "@mui/material/Typography";
import Container from "$atoms/Container";
import type {
  TreeNodeSchema,
  TreeResultSchema,
} from "$server/models/book/tree";
import type { BookSchema } from "$server/models/book";
import Tree from "react-d3-tree";
import type { RawNodeDatum } from "react-d3-tree";
import getLocaleDateString from "$utils/getLocaleDateString";

type Props = {
  book: BookSchema;
  tree: TreeResultSchema;
};

function node2RawNodeDatum(node: TreeNodeSchema): RawNodeDatum {
  const attributes: Record<string, string> = {};
  if (node.release?.version != null) {
    attributes["バージョン"] = node.release.version;
  }
  if (node.release?.releasedAt instanceof Date) {
    attributes["リリース日"] = getLocaleDateString(node.release.releasedAt);
  }
  return {
    name: node.name || "",
    attributes,
    children: [],
  };
}

function tree2RawNodeDatum(tree: TreeResultSchema): RawNodeDatum {
  const nodeMap: Map<number, RawNodeDatum> = new Map();
  for (const node of tree.nodes) {
    const rawNodeDatam = node2RawNodeDatum(node);
    nodeMap.set(node.id, rawNodeDatam);
    if (node.parentId) {
      const { children } = nodeMap.get(node.parentId) || {};
      if (children) {
        children.push(rawNodeDatam);
      }
    }
  }
  const ret = tree.rootId != null && nodeMap.get(tree.rootId);
  return ret || { name: "No Data" };
}

function getD3TreeOptions() {
  return {
    draggable: true,
    nodeSize: {
      x: 220,
      y: 150,
    },
    translate: {
      x: 40,
      y: 100,
    },
    zoom: 1.0,
    zoomable: false,
  };
}

function BookTreeDiagram(props: Props) {
  const data = tree2RawNodeDatum(props.tree);
  const options = getD3TreeOptions();
  return (
    <Container
      maxWidth="md"
      sx={{
        my: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100vh",
      }}
    >
      <Typography variant="h4">{props.book.name}</Typography>
      <Tree data={data} {...options}></Tree>
    </Container>
  );
}

export default BookTreeDiagram;
