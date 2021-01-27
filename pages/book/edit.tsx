import { useRouter } from "next/router";
import type { BookProps, BookSchema } from "$server/models/book";
import type { SectionProps } from "$server/models/book/section";
import BookEdit from "$templates/BookEdit";
import Placeholder from "$templates/Placeholder";
import Unknown from "$templates/Unknown";
import { destroyBook, updateBook, useBook } from "$utils/book";
import { pagesPath } from "$utils/$path";

export type Query = { bookId: BookSchema["id"]; prev?: "/books" | "/link" };

function Edit({ bookId, prev }: Query) {
  const book = useBook(bookId);
  const router = useRouter();
  async function handleSubmit(props: BookProps) {
    await updateBook({ id: bookId, ...props });
    switch (prev) {
      case "/books":
      case "/link":
        return router.push(prev);
      default:
        return router.push(pagesPath.book.$url({ query: { bookId } }));
    }
  }
  async function handleDelete({ id }: Pick<BookSchema, "id">) {
    await destroyBook(id);
    switch (prev) {
      case "/link":
        return router.push(prev);
      default:
        return router.push(pagesPath.books.$url());
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
  function toBookImport() {
    return router.push(
      pagesPath.book.import.$url({
        query: { bookId, ...(prev && { prev }) },
      })
    );
  }
  function toTopic(path: "import" | "new") {
    return router.push(
      pagesPath.book.topic[path].$url({
        query: { bookId, ...(prev && { prev }) },
      })
    );
  }
  const handlers = {
    onSubmit: handleSubmit,
    onDelete: handleDelete,
    onAddSection: handleAddSection,
    onBookImportClick: () => toBookImport(),
    onTopicImportClick: () => toTopic("import"),
    onTopicNewClick: () => toTopic("new"),
  };
  if (!book) return <Placeholder />;

  return <BookEdit book={book} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { prev }: Pick<Query, "prev"> = router.query;

  if (!Number.isFinite(bookId))
    return (
      <Unknown header="ブックがありません">
        ブックが見つかりませんでした
      </Unknown>
    );

  return <Edit bookId={bookId} prev={prev} />;
}

export default Router;
