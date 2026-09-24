import { useAppRouter } from "$utils/useAppRouter";
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
  cloneBook,
  destroyBook,
  revalidateBook,
  updateBook,
  updateMetainfoBook,
  updateReleaseBook,
  useBook,
} from "$utils/book";
import {
  bookEditTopicEditUrl,
  bookEditTopicNewUrl,
  bookEditUrl,
  bookImportUrl,
  bookOverwriteUrl,
  bookReleaseUrl,
  bookTopicImportUrl,
  bookUrl,
  contextUrl,
  paths,
} from "$utils/routes";
import useBookLinkingHandlers from "$utils/useBookLinkingHandlers";
import useAuthorsHandler from "$utils/useAuthorsHandler";
import type { ReleaseProps } from "$server/models/book/release";
import { mutateReleasebooks } from "$utils/useReleaseBooks";
import type { MetainfoProps } from "$server/models/metainfo";

export type Query = {
  bookId: BookSchema["id"];
  context?: "books" | "topics" | "courses";
};

function Edit({ bookId, context }: Query) {
  const query = { bookId, ...(context && { context }) };
  const { session, isContentEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isContentEditable);
  const router = useAppRouter();
  const { onBookLinking } = useBookLinkingHandlers();
  const { handleAuthorsUpdate, handleAuthorSubmit } = useAuthorsHandler(
    book && { type: "book", ...book }
  );
  const back = () => {
    switch (context) {
      case "books":
      case "topics":
      case "courses":
        return router.push(contextUrl(context));
      default:
        return router.push(bookUrl({ bookId: query.bookId }));
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
  async function handleDelete(book: BookSchema, withtopic?: boolean) {
    await destroyBook(book.id, withtopic ?? false, book);
    switch (context) {
      case "books":
      case "topics":
        return router.push(contextUrl(context));
      default:
        return router.push(paths.books);
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
    const url = bookEditTopicEditUrl({ ...query, topicId: topic.id });
    return router.push(url);
  }
  function handleTopicNewClick() {
    return router.push(bookEditTopicNewUrl(query));
  }
  function handleBookImportClick() {
    return router.push(bookImportUrl(query));
  }
  function handleTopicImportClick() {
    return router.push(bookTopicImportUrl(query));
  }
  const handleOverwriteClick = () => {
    return router.push(bookOverwriteUrl({ bookId }));
  };
  async function handleReleaseUpdate(release: ReleaseProps) {
    if (!book) return;
    await updateReleaseBook({
      id: book.id,
      ...release,
    });
    await mutateReleasebooks(book.id);
  }
  async function handleRelease({ id }: Pick<BookSchema, "id">) {
    return router.push(
      bookReleaseUrl({
        bookId: id,
        ...(context && { context }),
      })
    );
  }
  async function handleItemEditClick(bookId: BookSchema["id"]) {
    return router.push(
      bookEditUrl({
        bookId,
        ...(context && { context }),
      })
    );
  }
  async function handleClone({ id }: Pick<BookSchema, "id">) {
    const created = await cloneBook(id);
    return router.push(
      bookEditUrl({
        bookId: created.id,
        ...(context && { context }),
      })
    );
  }
  async function handleMetainfoUpdate(metainfo: MetainfoProps) {
    if (book) {
      const _res = await updateMetainfoBook(book.id, metainfo);
      await revalidateBook(book.id);
    }
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
    onClone: handleClone,
    onMetainfoUpdate: handleMetainfoUpdate,
  };

  if (error) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  const Template = book.release ? BookEditReleased : BookEdit;

  return <Template book={book} {...handlers} />;
}

function Router() {
  const router = useAppRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Edit bookId={bookId} context={context} />;
}

export default Router;
