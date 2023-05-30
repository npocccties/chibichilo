import Typography from "@mui/material/Typography";
import Container from "$atoms/Container";
import type {
  TreeNodeAuthorsSchema,
  TreeNodeSchema,
  TreeResultSchema,
} from "$server/models/book/tree";
import type { BookSchema } from "$server/models/book";
import Tree from "react-d3-tree";
import type {
  RawNodeDatum,
  RenderCustomNodeElementFn,
  TreeNodeEventCallback,
  Point,
  TreeNodeDatum,
} from "react-d3-tree";
import { css } from "@emotion/css";
import { gray, primary } from "$theme/colors";
import getLocaleDateTimeString from "$utils/getLocaleDateTimeString";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useState } from "react";
import { useSessionAtom } from "$store/session";
import type { SessionSchema } from "$server/models/session";

type Props = {
  book: BookSchema;
  tree: TreeResultSchema;
  onNodeClick: (
    nodeType: TreeNodeType,
    node: TreeNodeSchema | undefined
  ) => void;
};

export type TreeNodeType = "target" | "normal" | "notshared" | "deleted";

function isAuthor(
  authors: TreeNodeAuthorsSchema[] | undefined,
  userId: number | undefined
): boolean {
  if (!authors || typeof userId === "undefined") return false;
  return authors.some((author) => author.id === userId);
}

function node2type(
  node: TreeNodeSchema,
  targetId: number,
  session: SessionSchema | undefined
): TreeNodeType {
  if (node.id === targetId) {
    return "target";
  }
  if (node.name) {
    if (isAuthor(node.authors, session?.user.id) || node.shared) {
      return "normal";
    } else {
      return "notshared";
    }
  }
  return "deleted";
}

function creators(authors: TreeNodeAuthorsSchema[]): string[] {
  return authors
    .filter((author) => author.roleName === "作成者")
    .map((author) => author.name);
}

function node2RawNodeDatum(
  node: TreeNodeSchema,
  targetId: number,
  session: SessionSchema | undefined
): RawNodeDatum {
  let name = "";
  const attributes: Record<string, string | number | boolean> = {};
  attributes["id"] = node.id;

  const nodeType: TreeNodeType = node2type(node, targetId, session);
  attributes["type"] = nodeType;

  if (nodeType === "target" || nodeType === "normal") {
    if (node.name) {
      name = node.name;
    }
    if (node.release?.version != null) {
      attributes["version"] = node.release.version;
    }
    if (node.release?.releasedAt instanceof Date) {
      attributes["releasedAt"] = getLocaleDateTimeString(
        node.release.releasedAt
      );
    }
    if (node.authors != null) {
      attributes["creators"] = creators(node.authors).join(",");
    }
  }

  return {
    name,
    attributes,
    children: [],
  };
}

function setNumberOfFork(node: RawNodeDatum): number {
  let sum = 0;
  if (node.children) {
    for (const child of node.children) {
      sum = sum + setNumberOfFork(child);
      if (child.attributes?.type !== "deleted") {
        sum = sum + 1;
      }
    }
  }
  if (node.attributes && node.name && sum > 0) {
    node.attributes["forks"] = `フォーク数: ${sum}`;
  }
  return sum;
}

function tree2RawNodeDatum(
  { book, tree }: Props,
  session: SessionSchema | undefined
): RawNodeDatum {
  const nodeMap: Map<number, RawNodeDatum> = new Map();

  // すべてのノードを登録する
  for (const node of tree.nodes) {
    const rawNodeDatum = node2RawNodeDatum(node, book.id, session);
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

  // rootId ノードを探す
  const ret = tree.rootId != null && nodeMap.get(tree.rootId);

  // フォーク数を計算して設定する
  if (ret) {
    setNumberOfFork(ret);
  }

  return ret || { name: "No Data" };
}

function type2className(type: string | undefined) {
  if (!type) type = "normal";
  return `rd3t-${type}-node`;
}

const circleStyle = css`
  circle.${type2className("normal")} {
    fill: ${gray[100]};
  }
  circle.${type2className("target")} {
    fill: ${primary[400]};
  }
  circle.${type2className("notshared")} {
    stroke-dasharray: 2;
    fill: ${gray[100]};
  }
  circle.${type2className("deleted")} {
    stroke: ${gray[500]};
    stroke-dasharray: 2;
    fill: ${gray[100]};
  }
`;

const renderCustomNodeElement: RenderCustomNodeElementFn = ({
  nodeDatum,
  onNodeClick,
}) => {
  const className = type2className(
    nodeDatum.attributes?.type as string | undefined
  );

  return (
    <>
      <circle r="15" onClick={onNodeClick} className={className}></circle>
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
          {nodeDatum.attributes?.creators && (
            <tspan x="40" dy="1.2em">
              {nodeDatum.attributes.creators}
            </tspan>
          )}
          {nodeDatum.attributes?.forks && (
            <tspan x="40" dy="1.2em">
              {nodeDatum.attributes.forks}
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
    zoomable: false,
  };
}

const defaultPosition: Point = { x: 40, y: 100 };
const currentPosition: Point = { x: 0, y: 0 };

function setCurrentPosition(p: Point) {
  currentPosition.x = p.x;
  currentPosition.y = p.y;
}

function getCurrentPosition(): Point {
  const { x, y } = currentPosition;
  return { x, y };
}

function getNode(tree: TreeResultSchema, id: number) {
  return tree.nodes.filter((node) => node.id == id)[0];
}

function BookTreeDiagram(props: Props) {
  const { session } = useSessionAtom();
  const data = tree2RawNodeDatum(props, session);
  const options = getD3TreeOptions();
  const [zoom, setZoom] = useState(1.0);
  const [translate, setTranslate] = useState<Point>(defaultPosition);
  const ratio = 1.1;

  const onNodeClickRaw: TreeNodeEventCallback = (d3node, _) => {
    const nodeType = d3node.data.attributes?.type as TreeNodeType;
    let node: TreeNodeSchema | undefined;
    if (nodeType === "target" || nodeType === "normal") {
      if (typeof d3node.data.attributes?.id === "number") {
        node = getNode(props.tree, d3node.data.attributes?.id);
      }
    }
    if (nodeType) {
      props.onNodeClick(nodeType, node);
    }
  };

  function onUpdate({
    translate,
  }: {
    node: TreeNodeDatum | null;
    translate: Point;
    zoom: number;
  }) {
    setCurrentPosition(translate);
  }

  function handleZoomIn() {
    let newZoom = zoom * ratio;
    if (newZoom > 1.0) newZoom = 1.0;
    setZoom(newZoom);
    setTranslate(getCurrentPosition());
  }

  function handleZoomOut() {
    setZoom(zoom / ratio);
    setTranslate(getCurrentPosition());
  }

  function handleReset() {
    setZoom(1.0);
    setTranslate(defaultPosition);
  }

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
      <Box
        sx={{
          display: "flex",
          gap: 2,
        }}
      >
        <Button
          disabled={zoom >= 1.0}
          size="small"
          color="primary"
          onClick={handleZoomIn}
        >
          <ZoomInIcon />
          拡大
        </Button>
        <Button size="small" color="primary" onClick={handleZoomOut}>
          <ZoomOutIcon />
          縮小
        </Button>
        <Button size="small" color="primary" onClick={handleReset}>
          <RestartAltIcon />
          リセット
        </Button>
      </Box>
      <Tree
        data={data}
        zoom={zoom}
        translate={translate}
        {...options}
        onNodeClick={onNodeClickRaw}
        onUpdate={onUpdate}
      />
    </Container>
  );
}

export default BookTreeDiagram;
