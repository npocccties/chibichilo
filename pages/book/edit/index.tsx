import { useRouter } from "next/router";
import type { BookSchema } from "$server/models/book";
import type { BookPropsWithSubmitOptions } from "$types/bookPropsWithSubmitOptions";
import type { SectionProps } from "$server/models/book/section";
import type { TopicSchema } from "$server/models/topic";
import type { ContentAuthors } from "$server/models/content";
import { useSessionAtom } from "$store/session";
import BookEdit from "$templates/BookEdit";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$templates/TopicNotFoundProblem";
import { destroyBook, updateBook, useBook } from "$utils/book";
import { pagesPath } from "$utils/$path";
import useBookLinkHandler from "$utils/useBookLinkHandler";
import useAuthorsHandler from "$utils/useAuthorsHandler";
import ReleasedBook from "$templates/ReleasedBook";
import useDialogProps from "$utils/useDialogProps";
import TopicPreviewDialog from "$organisms/TopicPreviewDialog";

export type Query = {
  bookId: BookSchema["id"];
  context?: "books" | "topics" | "courses";
};

function Edit({ bookId, context }: Query) {
  const query = { bookId, ...(context && { context }) };
  const { session, isContentEditable } = useSessionAtom();
  const { book, error } = useBook(bookId, isContentEditable);
  const router = useRouter();
  const handleBookLink = useBookLinkHandler();
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
    sections: _sections,
    submitWithLink: _submitWithLink,
    ...props
  }: BookPropsWithSubmitOptions) {
    await updateBook({ id: bookId, ...props });
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
    const action = isContentEditable(topic) ? "edit" : "generate";
    const url = pagesPath.book.edit.topic[action].$url({
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
  async function handleReleaseButtonClick() {
    return router.push(pagesPath.book.release.$url({ query }));
  }
  async function onLinkButtonClick() {
    await handleBookLink({ id: bookId });
  }
  const {
    data: previewTopic,
    dispatch: setPreviewTopic,
    ...dialogProps
  } = useDialogProps<TopicSchema>();
  const handleTopicPreviewClick = (topic: TopicSchema) =>
    setPreviewTopic(topic);
  const linked = bookId === session?.ltiResourceLink?.bookId;
  const handlers = {
    linked,
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
    onLinkButtonClick,
    onReleaseButtonClick: handleReleaseButtonClick,
    isContentEditable: () => true,
  };

  if (error) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  if (book.release) {
    const handlers_for_releasedbook = {
      onTopicPreview: handleTopicPreviewClick,
      onLinkButtonClick,
      onForkButtonClick: () => {
        console.log("fork button");
      },
      onReleaseEditButtonClick: handleReleaseButtonClick,
      onDeleteButtonClick: handleDelete,
    };
    return (
      <>
        <ReleasedBook
          book={book}
          linked={linked}
          {...handlers_for_releasedbook}
        />
        ;
        {previewTopic && (
          <TopicPreviewDialog {...dialogProps} topic={previewTopic} />
        )}
      </>
    );
  }

  return <BookEdit book={book} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { context }: Pick<Query, "context"> = router.query;

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Edit bookId={bookId} context={context} />;
}

export default Router;
