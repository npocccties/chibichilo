import { useRouter } from "next/router";
import type { BookSchema } from "$server/models/book";
import type { BookPropsWithSubmitOptions } from "$types/bookPropsWithSubmitOptions";
import type { SectionProps } from "$server/models/book/section";
import type { TopicSchema } from "$server/models/topic";
import type { ContentAuthors } from "$server/models/content";
import { useSessionAtom } from "$store/session";
import BookEdit from "$templates/BookEdit";
import BookEditReleased from "$templates/BookEditReleased";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$templates/BookNotFoundProblem";
import {
  destroyBook,
  updateBook,
  updateReleaseBook,
  useBook,
} from "$utils/book";
import { pagesPath } from "$utils/$path";
import useBookLinkingHandlers from "$utils/useBookLinkingHandlers";
import useAuthorsHandler from "$utils/useAuthorsHandler";
import type { ReleaseProps } from "$server/models/book/release";

export type Query = {
  bookId: BookSchema["id"];
  context?: "books" | "topics" | "courses";
};

function Edit({ bookId, context }: Query) {
  const query = { bookId, ...(context && { context }) };
  const { session, isContentEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isContentEditable);
  const router = useRouter();
  const { onBookLinking } = useBookLinkingHandlers();
  const { handleAuthorsUpdate, handleAuthorSubmit } = useAuthorsHandler(
    book && { type: "book", ...book }
  );
  const back = () => {
    switch (context) {
      case "books":
      case "topics":
      case "courses":
        return router.push(pagesPath[context].$url());
      default:
        return router.push(pagesPath.book.$url({ query }));
    }
  };
  async function handleSubmit({
    sections: _,
    submitWithLink,
    ...props
  }: BookPropsWithSubmitOptions) {
    await updateBook({ id: bookId, ...props });
    if (submitWithLink) await onBookLinking?.({ id: bookId });
    return back();
  }
  async function handleDelete({ id }: Pick<BookSchema, "id">) {
    await destroyBook(id);
    switch (context) {
      case "books":
      case "topics":
        return router.push(pagesPath[context].$url());
      default:
        return router.push(pagesPath.books.$url());
    }
  }
  function handleCancel() {
    return back();
  }
  async function handleSectionsUpdate(sections: SectionProps[]) {
    if (!book) return;
    await updateBook({
      ...book,
      sections: sections.filter((section) => section.topics.length > 0),
    });
  }
  function handleTopicEditClick(
    topic: Pick<TopicSchema, "id"> & ContentAuthors
  ) {
    const url = pagesPath.book.edit.topic.edit.$url({
      query: { ...query, topicId: topic.id },
    });
    return router.push(url);
  }
  function handleTopicNewClick() {
    return router.push(pagesPath.book.edit.topic.new.$url({ query }));
  }
  function handleBookImportClick() {
    return router.push(pagesPath.book.import.$url({ query }));
  }
  function handleTopicImportClick() {
    return router.push(pagesPath.book.topic.import.$url({ query }));
  }
  const handleOverwriteClick = () => {
    return router.push(pagesPath.book.overwrite.$url({ query: { bookId } }));
  };
  async function handleReleaseUpdate(release: ReleaseProps) {
    if (!book) return;
    await updateReleaseBook({
      id: book.id,
      ...release,
    });
  }
  async function handleRelease({ id }: Pick<BookSchema, "id">) {
    return router.push(
      pagesPath.book.release.$url({
        query: { bookId: id, ...(context && { context }) },
      })
    );
  }
  async function handleItemEditClick(bookId: BookSchema["id"]) {
    return router.push(pagesPath.book.edit.$url({ query: { bookId } }));
  }
  const handlers = {
    linked: bookId === session?.ltiResourceLink?.bookId,
    onSubmit: handleSubmit,
    onDelete: handleDelete,
    onCancel: handleCancel,
    onSectionsUpdate: handleSectionsUpdate,
    onBookImportClick: handleBookImportClick,
    onTopicImportClick: handleTopicImportClick,
    onTopicNewClick: handleTopicNewClick,
    onTopicEditClick: handleTopicEditClick,
    onAuthorsUpdate: handleAuthorsUpdate,
    onAuthorSubmit: handleAuthorSubmit,
    isContentEditable,
    onOverwriteClick: handleOverwriteClick,
    onReleaseUpdate: handleReleaseUpdate,
    onRelease: handleRelease,
    onItemEditClick: handleItemEditClick,
  };

  if (error) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  const Template = book.release ? BookEditReleased : BookEdit;

  return <Template book={book} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Edit bookId={bookId} context={context} />;
}

export default Router;
