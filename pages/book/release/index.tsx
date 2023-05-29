import { useRouter } from "next/router";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$templates/BookNotFoundProblem";
import { useSessionAtom } from "$store/session";
import { releaseBook, useBook } from "$utils/book";
import type { Query as BookEditQuery } from "../edit";
import { pagesPath } from "$utils/$path";
import type { Props as ReleaseEditProps } from "$templates/ReleaseEdit";
import ReleaseEdit from "$templates/ReleaseEdit";
import type { ReleaseProps } from "$server/models/book/release";
import useBookTree from "$utils/useBookTree";
import type {
  TreeNodeSchema,
  TreeResultSchema,
} from "$server/models/book/tree";

export type Query = BookEditQuery;

function getNode(tree: TreeResultSchema, id: number) {
  return tree.nodes.filter((node) => node.id == id)[0];
}

function getParentNode(
  tree: TreeResultSchema,
  node: TreeNodeSchema
): TreeNodeSchema | undefined {
  // 親ブックIDを取得
  const parentId = node.parentId;
  if (parentId == null) return;

  // 親ブックノードを取得
  return getNode(tree, parentId);
}

function getParentBook(
  bookId: number,
  tree: TreeResultSchema
): ReleaseEditProps["parentBook"] {
  let node: TreeNodeSchema | undefined = getNode(tree, bookId);

  while (node) {
    const parentNode = getParentNode(tree, node);

    // リリース情報があれば返す
    const { id, name, release } = parentNode || {};
    if (id && name && release) {
      return { id, name, release };
    }

    // 先祖を辿る
    node = parentNode;
  }

  return;
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
