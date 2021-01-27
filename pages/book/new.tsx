import { useRouter } from "next/router";
import { BookProps } from "$server/models/book";
import BookNew from "$templates/BookNew";
import { createBook } from "$utils/book";
import { pagesPath } from "$utils/$path";

export type Query = { context?: "books" | "link" };

function New() {
  const router = useRouter();
  const handleSubmit = async (book: BookProps) => {
    const { id } = await createBook(book);
    const { context }: Pick<Query, "context"> = router.query;
    await router.replace(
      pagesPath.book.edit.$url({
        query: {
          bookId: id,
          ...(context && { context }),
        },
      })
    );
  };

  return <BookNew onSubmit={handleSubmit} />;
}

export default New;
