import { useRouter } from "next/router";
import type { BookSchema } from "$server/models/book";
import { useSessionAtom } from "$store/session";
import { updateLtiResourceLink } from "$utils/ltiResourceLink";
import useBooks from "$utils/useBooks";
import BookLink from "$templates/BookLink";
import Placeholder from "$templates/Placeholder";
import { pagesPath } from "$utils/$path";

function Index() {
  const router = useRouter();
  const { session, isBookEditable } = useSessionAtom();
  const booksProps = useBooks();
  const ltiLaunchBody = session?.ltiLaunchBody;
  const ltiResourceLink = ltiLaunchBody && {
    consumerId: ltiLaunchBody.oauth_consumer_key,
    id: ltiLaunchBody.resource_link_id,
    title: ltiLaunchBody.resource_link_title ?? "",
    contextId: ltiLaunchBody.context_id,
    contextTitle: ltiLaunchBody.context_title ?? "",
    contextLabel: ltiLaunchBody.context_label ?? "",
  };
  async function handleSubmit(book: Pick<BookSchema, "id">) {
    if (ltiResourceLink == null) return;
    const bookId = book.id;
    await updateLtiResourceLink({ ...ltiResourceLink, bookId });
    return router.push(pagesPath.book.$url({ query: { bookId } }));
  }
  function handleCancel() {
    const ltiResourceLink = session?.ltiResourceLink;
    if (!ltiResourceLink) return router.push(pagesPath.books.$url());
    return router.push(
      pagesPath.book.$url({ query: { bookId: ltiResourceLink.bookId } })
    );
  }
  function handleBookEdit(book: Pick<BookSchema, "id" | "author">) {
    const action = isBookEditable(book) ? "edit" : "generate";
    return router.push(
      pagesPath.book[action].$url({
        query: { bookId: book.id, context: "link" },
      })
    );
  }
  function handleBookNew() {
    return router.push(pagesPath.book.new.$url({ query: { context: "link" } }));
  }
  const handlers = {
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onBookEditClick: handleBookEdit,
    onBookNewClick: handleBookNew,
    isBookEditable,
  };

  if (ltiResourceLink == null) return <Placeholder />;

  return (
    <BookLink ltiResourceLink={ltiResourceLink} {...booksProps} {...handlers} />
  );
}

export default Index;
