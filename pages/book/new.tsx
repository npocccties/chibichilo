import { useRouter } from "next/router";
import { BookProps } from "$server/models/book";
import BookNew from "$templates/BookNew";
import { createBook } from "$utils/book";
import { pagesPath } from "$utils/$path";

export type Query = {
  prev?: "/books" | "/link";
};

function New() {
  const router = useRouter();
  const handleSubmit = async (book: BookProps) => {
    const { id } = await createBook(book);
    const { prev }: Pick<Query, "prev"> = router.query;
    await router.replace(
      pagesPath.book.edit.$url({
        query: {
          bookId: id,
          ...(prev && { prev }),
        },
      })
    );
  };

  return <BookNew onSubmit={handleSubmit} />;
}

export default New;
