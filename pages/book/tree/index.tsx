import { useRouter } from "next/router";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$templates/TopicNotFoundProblem";
import useBookTree from "$utils/useBookTree";
import BookTreeDiagram from "$templates/BookTreeDiagram";
import type { TreeNodeType } from "$templates/BookTreeDiagram";
import { useSessionAtom } from "$store/session";
import { useBook } from "$utils/book";
import type { BookSchema } from "$server/models/book";
import type { Query as BookEditQuery } from "$pages/book/edit";
import { useState } from "react";
import type { TreeNodeSchema } from "$server/models/book/tree";
import BookTreeDialog from "$organisms/BookTreeDialog";

export type Query = BookEditQuery;

function BookTree({ bookId }: { bookId: BookSchema["id"] }) {
  const { isContentEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isContentEditable);
  const { tree, error: error2 } = useBookTree(bookId);
  const [nodeType, setNodeType] = useState<TreeNodeType | undefined>();
  const [node, setNode] = useState<TreeNodeSchema | undefined>();
  const [open, setOpen] = useState(false);

  if (error || error2) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;
  if (!tree) return <Placeholder />;

  function onNodeClick(
    nodeType: TreeNodeType,
    node: TreeNodeSchema | undefined
  ) {
    setNodeType(nodeType);
    setNode(node);
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <BookTreeDiagram book={book} tree={tree} onNodeClick={onNodeClick} />;
      <BookTreeDialog
        nodeType={nodeType}
        node={node}
        open={open}
        onClose={handleClose}
      />
    </>
  );
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <BookTree bookId={bookId} />;
}

export default Router;
