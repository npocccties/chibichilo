import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import makeStyles from "@mui/styles/makeStyles";
import DescriptionList from "$atoms/DescriptionList";
import useCardStyles from "$styles/card";
import type {
  TreeNodeAuthorsSchema,
  TreeNodeSchema,
} from "$server/models/book/tree";
import { useMemo } from "react";
import StripedMarkdown from "$atoms/StripedMarkdown";
import groupBy from "lodash.groupby";
import getLocaleListString from "$utils/getLocaleListString";
import getLocaleDateTimeString from "$utils/getLocaleDateTimeString";
import type { TreeNodeType } from "$templates/BookTreeDiagram";

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
}));

export type Props = {
  nodeType?: TreeNodeType;
  node?: TreeNodeSchema;
  open: boolean;
  onClose: React.MouseEventHandler;
};

function date2string(date: Date | undefined): string | undefined {
  return date ? getLocaleDateTimeString(date) : undefined;
}

function authors(
  authors: TreeNodeAuthorsSchema[] | undefined
): Record<string, string> {
  const ret: Record<string, string> = {};
  if (authors == null) return ret;

  for (const [key, value] of Object.entries(
    groupBy(authors, (author) => author.roleName)
  )) {
    ret[key] = getLocaleListString(
      value.map((author) => author.name),
      "ja"
    );
  }
  return ret;
}

function useNodeBody(node: TreeNodeSchema | undefined) {
  return useMemo(
    () => ({
      タイトル: node?.name,
      バージョン: node?.release?.version,
      リリース日: date2string(node?.release?.releasedAt),
      コメント: node?.release?.comment,
      作成日: date2string(node?.createdAt),
      更新日: date2string(node?.updatedAt),
      ...authors(node?.authors),
      解説: node?.description ? (
        <StripedMarkdown content={node?.description} />
      ) : null,
    }),
    [node]
  );
}

function nodeType2msg(nodeType: TreeNodeType | undefined): string {
  let ret = "不明なブック";
  switch (nodeType) {
    case "target":
    case "normal":
      ret = "ブック詳細";
      break;
    case "notshared":
      ret = "シェアされていないブック";
      break;
    case "deleted":
      ret = "削除されたブック";
      break;
  }
  return ret;
}

export default function BookTreeDialog(props: Props) {
  const cardClasses = useCardStyles();
  const classes = useStyles();
  const { nodeType, node, open, onClose } = props;
  const nodeBody = useNodeBody(node);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ classes: cardClasses }}
      fullWidth
    >
      <DialogContent>
        <Typography className={classes.title} variant="h5">
          {nodeType2msg(nodeType)}
        </Typography>
        <DescriptionList
          value={Object.entries(nodeBody).flatMap(([key, value]) =>
            value == null ? [] : [{ key, value }]
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
