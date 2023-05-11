import Typography from "@mui/material/Typography";
import Container from "$atoms/Container";
import type {
  TreeNodeSchema,
  TreeResultSchema,
} from "$server/models/book/tree";
import type { BookSchema } from "$server/models/book";
import Tree from "react-d3-tree";
import type {
  RawNodeDatum,
  RenderCustomNodeElementFn,
  TreeNodeEventCallback,
} from "react-d3-tree";
import { css } from "@emotion/css";
import { gray, primary } from "$theme/colors";
import getLocaleDateTimeString from "$utils/getLocaleDateTimeString";

type Props = {
  book: BookSchema;
  tree: TreeResultSchema;
  onNodeClick?: (id: number) => void;
};

function node2RawNodeDatum(
  node: TreeNodeSchema,
  targetId: number
): RawNodeDatum {
  const attributes: Record<string, string | number | boolean> = {};
  attributes["id"] = node.id;
  if (node.id === targetId) {
    attributes["type"] = "target";
  }
  if (node.release?.version != null) {
    attributes["version"] = node.release.version;
  }
  if (node.release?.releasedAt instanceof Date) {
    attributes["releasedAt"] = getLocaleDateTimeString(node.release.releasedAt);
  }
  return {
    name: node.name || "",
    attributes,
    children: [],
  };
}

function tree2RawNodeDatum({ book, tree }: Props): RawNodeDatum {
  const nodeMap: Map<number, RawNodeDatum> = new Map();

  // すべてのノードを登録する
  for (const node of tree.nodes) {
    const rawNodeDatum = node2RawNodeDatum(node, book.id);
    nodeMap.set(node.id, rawNodeDatum);
  }

  // ノードを接続する
  for (const node of tree.nodes) {
    const rawNodeDatum = nodeMap.get(node.id);
    if (rawNodeDatum && node.parentId) {
      const { children } = nodeMap.get(node.parentId) || {};
      if (children) {
        children.push(rawNodeDatum);
      }
    }
  }
  const ret = tree.rootId != null && nodeMap.get(tree.rootId);
  return ret || { name: "No Data" };
}

const circleClass = { className: "rd3t-target-node" };

const circleStyle = css`
  circle {
    fill: ${gray[100]};
  }
  circle.${circleClass.className} {
    fill: ${primary[400]};
  }
`;

const renderCustomNodeElement: RenderCustomNodeElementFn = ({
  nodeDatum,
  onNodeClick,
}) => {
  const target = nodeDatum.attributes?.type === "target" ? circleClass : {};

  return (
    <>
      <circle r="15" onClick={onNodeClick} {...target}></circle>
      <g className="rd3t-label">
        <text className="rd3t-label__title" textAnchor="start" x="40">
          {nodeDatum.name}
        </text>
        <text className="rd3t-label__attributes">
          {nodeDatum.attributes?.version && (
            <tspan x="40" dy="1.2em">
              {nodeDatum.attributes.version}
            </tspan>
          )}
          {nodeDatum.attributes?.releasedAt && (
            <tspan x="40" dy="1.2em">
              {nodeDatum.attributes.releasedAt}
            </tspan>
          )}
        </text>
      </g>
    </>
  );
};

function getD3TreeOptions() {
  return {
    collapsible: false,
    draggable: true,
    nodeSize: {
      x: 220,
      y: 150,
    },
    renderCustomNodeElement,
    svgClassName: circleStyle,
    translate: {
      x: 40,
      y: 100,
    },
    zoom: 1.0,
    zoomable: false,
  };
}

function BookTreeDiagram(props: Props) {
  const data = tree2RawNodeDatum(props);
  const options = getD3TreeOptions();

  const onNodeClickRaw: TreeNodeEventCallback = (node, _) => {
    if (props.onNodeClick && typeof node.data.attributes?.id === "number") {
      props.onNodeClick(node.data.attributes?.id);
    }
  };

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
      <Tree data={data} {...options} onNodeClick={onNodeClickRaw} />
    </Container>
  );
}

export default BookTreeDiagram;
