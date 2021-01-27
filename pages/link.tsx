import { User } from "@prisma/client";
import { useRouter } from "next/router";
import type { BookSchema } from "$server/models/book";
import { useSession } from "$utils/session";
import { updateLtiResourceLink } from "$utils/ltiResourceLink";
import { useUserBooks } from "$utils/userBooks";
import BookLink from "$templates/BookLink";
import Unknown from "$templates/Unknown";
import Placeholder from "$templates/Placeholder";
import { pagesPath } from "$utils/$path";

function Link(
  props: Omit<Parameters<typeof BookLink>[0], "books"> & { userId: User["id"] }
) {
  const userBooks = useUserBooks(props.userId);
  const books = userBooks.data?.books ?? [];
  return <BookLink {...props} books={books} />;
}

function Index() {
  const router = useRouter();
  const session = useSession();
  const userId = session.data?.user?.id;
  const ltiLaunchBody = session.data?.ltiLaunchBody;
  const ltiResourceLink = ltiLaunchBody && {
    id: ltiLaunchBody.resource_link_id,
    title: ltiLaunchBody.resource_link_title ?? "",
    contextId: ltiLaunchBody.context_id,
    contextTitle: ltiLaunchBody.context_title ?? "",
  };
  async function handleSubmit(bookId: BookSchema["id"]) {
    if (ltiResourceLink == null) return;
    await updateLtiResourceLink({ ...ltiResourceLink, bookId });
    return router.push(pagesPath.book.$url({ query: { bookId } }));
  }
  function handleBookEdit({ id }: Pick<BookSchema, "id">) {
    return router.push(
      pagesPath.book.edit.$url({
        query: { bookId: id, prev: "/link" },
      })
    );
  }
  function handleBookNew() {
    return router.push(
      pagesPath.book.new.$url({
        query: { prev: "/link" },
      })
    );
  }
  const handlers = {
    onSubmit: handleSubmit,
    onBookEditClick: handleBookEdit,
    onBookNewClick: handleBookNew,
  };

  if (userId == null) return <Placeholder />;
  if (ltiResourceLink == null) return <Placeholder />;
  if (session.error) {
    return <Unknown header="セッション情報が得られませんでした" />;
  }

  return (
    <Link userId={userId} ltiResourceLink={ltiResourceLink} {...handlers} />
  );
}

export default Index;
