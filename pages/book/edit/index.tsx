import { useRouter } from "next/router";
import { useSession } from "$utils/session";
import type { BookProps, BookSchema } from "$server/models/book";
import type { SectionProps } from "$server/models/book/section";
import type { TopicSchema } from "$server/models/topic";
import BookEdit from "$templates/BookEdit";
import Placeholder from "$templates/Placeholder";
import Unknown from "$templates/Unknown";
import { destroyBook, updateBook, useBook } from "$utils/book";
import { pagesPath } from "$utils/$path";

export type Query = { bookId: BookSchema["id"]; context?: "books" | "link" };

function Edit({ bookId, context }: Query) {
  const book = useBook(bookId);
  const { data: session } = useSession();
  const router = useRouter();
  async function handleSubmit(props: BookProps) {
    await updateBook({ id: bookId, ...props });
    switch (context) {
      case "books":
      case "link":
        return router.push(pagesPath[context].$url());
      default:
        return router.push(pagesPath.book.$url({ query: { bookId } }));
    }
  }
  async function handleDelete({ id }: Pick<BookSchema, "id">) {
    await destroyBook(id);
    switch (context) {
      case "books":
      case "link":
        return router.push(pagesPath[context].$url());
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
  function handleTopicEditClick({ id }: Pick<TopicSchema, "id">) {
    return router.push(
      pagesPath.book.edit.topic.edit.$url({
        query: { bookId, topicId: id },
      })
    );
  }
  function toBookImport() {
    return router.push(
      pagesPath.book.import.$url({
        query: { bookId, ...(context && { context }) },
      })
    );
  }
  function toTopic(path: "import" | "new") {
    return router.push(
      pagesPath.book.topic[path].$url({
        query: { bookId, ...(context && { context }) },
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
    onTopicEditClick: handleTopicEditClick,
    isTopicEditable: (topic: TopicSchema) =>
      // NOTE: 自身以外の作成したトピックに関しては編集不可
      session?.user && topic.creator.id === session.user.id,
  };
  if (!book) return <Placeholder />;

  return <BookEdit book={book} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId))
    return (
      <Unknown header="ブックがありません">
        ブックが見つかりませんでした
      </Unknown>
    );

  return <Edit bookId={bookId} context={context} />;
}

export default Router;
