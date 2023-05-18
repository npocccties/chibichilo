import { useRouter } from "next/router";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$templates/TopicNotFoundProblem";
import { useSessionAtom } from "$store/session";
import { releaseBook, useBook } from "$utils/book";
import type { Query as BookEditQuery } from "../edit";
import { pagesPath } from "$utils/$path";
import type { Props as ReleaseEditProps } from "$templates/ReleaseEdit";
import ReleaseEdit from "$templates/ReleaseEdit";
import type { ReleaseProps } from "$server/models/book/release";
import useBookTree from "$utils/useBookTree";
import type { TreeResultSchema } from "$server/models/book/tree";

export type Query = BookEditQuery;

function getNode(tree: TreeResultSchema, id: number) {
  return tree.nodes.filter((node) => node.id == id)[0];
}

function getParentBook(
  bookId: number,
  tree: TreeResultSchema
): ReleaseEditProps["parentBook"] {
  let parentBook: ReleaseEditProps["parentBook"];
  const bookNode = getNode(tree, bookId);
  if (bookNode && bookNode.parentId) {
    const parentNode = getNode(tree, bookNode.parentId);
    if (parentNode) {
      const { name, release } = parentNode;
      if (name && release) {
        parentBook = { id: bookNode.parentId, name, release };
      }
    }
  }
  return parentBook;
}

function Release({ bookId, context }: Query) {
  const { isContentEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isContentEditable);
  const { tree, error: error2 } = useBookTree(bookId);
  const router = useRouter();
  const bookEditQuery = { bookId, ...(context && { context }) };
  const back = () =>
    router.push(pagesPath.book.edit.$url({ query: bookEditQuery }));
  async function handleSubmit(release: ReleaseProps) {
    if (!book) return;
    await releaseBook({ id: bookId, ...release });
    return back();
  }
  const handlers = {
    onSubmit: handleSubmit,
  };

  if (error) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  const parentBook = tree && !error2 ? getParentBook(bookId, tree) : undefined;

  return <ReleaseEdit book={book} parentBook={parentBook} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Release bookId={bookId} context={context} />;
}

export default Router;
