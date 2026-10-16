import { useCallback } from "react";
import { useAppRouter } from "$utils/useAppRouter";
import type { BookSchema } from "$server/models/book";
import type { BookPropsWithSubmitOptions } from "$types/bookPropsWithSubmitOptions";
import { bookEditUrl, bookUrl, contextUrl, paths } from "$utils/routes";
import { createBook } from "./book";
import useBookLinkingHandlers from "./useBookLinkingHandlers";
import useAuthorsHandler from "$utils/useAuthorsHandler";
import { updateBookAuthors } from "./bookAuthors";

function useBookNewHandlers(
  context: "books" | "topics" | "courses" | undefined,
  bookId?: BookSchema["id"]
) {
  const router = useAppRouter();
  const { onBookLinking } = useBookLinkingHandlers();
  const { handleAuthorsUpdate, handleAuthorSubmit } = useAuthorsHandler();
  const handleSubmit = useCallback(
    async ({
      authors,
      submitWithLink,
      topics,
      ...props
    }: BookPropsWithSubmitOptions) => {
      if (topics && topics.length)
        props.sections = getSectionsWithTopics(topics);
      const book = await createBook(props);
      await updateBookAuthors({
        id: book.id,
        authors: [
          ...book.authors.map(({ id, roleName }) => ({ id, roleName })),
          ...authors,
        ],
      });
      if (submitWithLink) await onBookLinking?.({ id: book.id });
      await router.replace(
        bookEditUrl({
          bookId: book.id,
          ...(context && { context }),
        })
      );
    },
    [router, context, onBookLinking]
  );
  const handleCancel = useCallback(() => {
    switch (context) {
      case "books":
      case "topics":
        return router.push(contextUrl(context));
      default:
        return router.push(bookId ? bookUrl({ bookId }) : paths.books);
    }
  }, [router, context, bookId]);
  const handlers = {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onAuthorsUpdate: handleAuthorsUpdate,
    onAuthorSubmit: handleAuthorSubmit,
  };

  return handlers;
}

function getSectionsWithTopics(topics: number[]) {
  const sections = [];
  for (const id of topics) {
    sections.push({ topics: [{ id }] });
  }
  return sections;
}

export default useBookNewHandlers;
