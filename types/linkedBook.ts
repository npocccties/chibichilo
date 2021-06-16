import type { BookSchema } from "$server/models/book";

export type LinkedBook = BookSchema & { editable: boolean };
