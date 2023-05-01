import type { Book, Node } from "@prisma/client";
import { AuthorSchema } from "../author";
import type { ReleaseSchema } from "./release";
import { releaseSchema } from "./release";

export type TreeNodeAuthorsSchema = Pick<
  AuthorSchema,
  "id" | "name" | "email" | "roleName"
>;

export const TreeNodeAuthorsSchema = {
  type: "object",
  required: ["id", "name", "email", "roleName"],
  properties: {
    id: AuthorSchema.properties.id,
    name: AuthorSchema.properties.name,
    email: AuthorSchema.properties.email,
    roleName: AuthorSchema.properties.roleName,
  },
  additionalProperties: false,
} as const;

export type TreeNodeSchema = Pick<Node, "id" | "parentId"> & {
  name?: Book["name"];
  description?: Book["description"];
  createdAt?: Book["createdAt"];
  updatedAt?: Book["updatedAt"];
  authors?: TreeNodeAuthorsSchema[];
  release?: ReleaseSchema | null;
};

export const TreeNodeSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "integer" },
    parentId: { type: "integer", nullable: true },
    name: { type: "string", nullable: true },
    description: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time", nullable: true },
    updatedAt: { type: "string", format: "date-time", nullable: true },
    authors: { type: "array", items: TreeNodeAuthorsSchema, nullable: true },
    release: { ...releaseSchema, nullable: true },
  },
  additionalProperties: false,
} as const;

export type TreeResultSchema = {
  rootId: Node["rootId"];
  nodes: TreeNodeSchema[];
};

export const TreeResultSchema = {
  type: "object",
  required: ["rootId", "nodes"],
  properties: {
    rootId: { type: "integer" },
    nodes: { type: "array", items: TreeNodeSchema },
  },
  additionalProperties: false,
} as const;
