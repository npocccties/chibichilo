import { useRouter } from "next/router";
import type { BookProps, BookSchema } from "$server/models/book";
import type { SectionProps } from "$server/models/book/section";
import BookEdit from "$templates/BookEdit";
import Placeholder from "$templates/Placeholder";
import Unknown from "$templates/Unknown";
import { destroyBook, updateBook, useBook } from "$utils/book";

export type Query = {
  bookId?: string;
  prev?: "/books" | "/link";
};

export type EditProps = { bookId: BookSchema["id"] } & Pick<Query, "prev">;

function Edit({ bookId, prev }: EditProps) {
  const book = useBook(bookId);
  const router = useRouter();
  async function handleSubmit(props: BookProps) {
    await updateBook({ id: bookId, ...props });
    switch (prev) {
      case "/books":
      case "/link":
        return router.push(prev);
      default:
        return router.push({ pathname: "/book", query: { bookId } });
    }
  }
  async function handleDelete({ id }: Pick<BookSchema, "id">) {
    await destroyBook(id);
    switch (prev) {
      case "/link":
        return router.push(prev);
      default:
        return router.push("/books");
    }
  }
  async function handleAddSection(section: SectionProps) {
    if (!book) return;
    await updateBook({
      ...book,
      ltiResourceLinks: undefined,
      sections: [...book?.sections, section],
    });
  }
  function toTopic(path: "import" | "new") {
    return router.push({
      pathname: `/book/topic/${path}`,
      query: { bookId, ...(prev && { prev }) },
    });
  }
  const handlers = {
    onSubmit: handleSubmit,
    onDelete: handleDelete,
    onAddSection: handleAddSection,
    onTopicImportClick: () => toTopic("import"),
    onTopicNewClick: () => toTopic("new"),
  };
  if (!book) return <Placeholder />;

  return <BookEdit book={book} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const query: Query = router.query;
  const bookId = Number(query.bookId);

  if (!Number.isFinite(bookId))
    return (
      <Unknown header="ブックがありません">
        ブックが見つかりませんでした
      </Unknown>
    );

  return <Edit bookId={bookId} prev={query.prev} />;
}

export default Router;
