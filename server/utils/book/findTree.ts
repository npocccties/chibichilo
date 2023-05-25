import type { Prisma, Book } from "@prisma/client";
import type {
  TreeNodeAuthorsSchema,
  TreeNodeSchema,
  TreeResultSchema,
} from "$server/models/book/tree";
import prisma from "$server/utils/prisma";
import type { Authorship } from "$server/utils/author/authorToAuthorSchema";
import {
  authorArg,
  authorToAuthorSchema,
} from "$server/utils/author/authorToAuthorSchema";

const nodeArg = {
  include: {
    book: {
      include: {
        authors: authorArg,
        release: true,
      },
    },
  },
};

type NodeWithBook = Prisma.NodeGetPayload<typeof nodeArg>;

async function findTree(
  bookId: Book["id"]
): Promise<TreeResultSchema | undefined> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      node: true,
    },
  });
  if (book == null) return;

  let { rootId } = book.node;
  if (rootId == null) rootId = bookId;

  const nodes = await prisma.node.findMany({
    where: {
      OR: [{ rootId }, { id: rootId }],
    },
    ...nodeArg,
    orderBy: {
      book: {
        createdAt: "asc",
      },
    },
  });

  return {
    rootId,
    nodes: nodes.map((node) => nodeToTreeNode(node)),
  };
}

function nodeToTreeNode(node: NodeWithBook): TreeNodeSchema {
  const { id, parentId } = node;
  const {
    name,
    description,
    shared,
    createdAt,
    updatedAt,
    authors = [],
    release,
  } = node.book || {};
  return {
    id,
    parentId,
    name,
    description,
    shared,
    createdAt,
    updatedAt,
    authors: authors.map((author) => authorToTreeNodeAuthor(author)),
    release,
  };
}

function authorToTreeNodeAuthor(author: Authorship): TreeNodeAuthorsSchema {
  const { id, name, email, roleName } = authorToAuthorSchema(author);
  return { id, name, email, roleName };
}

export default findTree;
