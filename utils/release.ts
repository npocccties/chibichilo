import type { ReleaseSchema } from "$server/models/book/release";
import type { RelatedBook } from "$server/models/topic";

export function getReleaseFromRelatedBooks(
  relatedBooks: RelatedBook[] | undefined
): ReleaseSchema | undefined {
  if (!relatedBooks) return;

  for (const relatedBook of relatedBooks) {
    if (relatedBook.release) {
      return relatedBook.release;
    }
  }
  return;
}
