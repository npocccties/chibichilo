import { User, Book } from "@prisma/client";
import { useRouter } from "next/router";
import { useSession } from "$utils/session";
import { useUserBooks } from "$utils/userBooks";
import Books from "$templates/Books";
import type { Query as BookQuery } from "./book";
import type { Query as BookEditQuery } from "./book/edit";

function UserBooks(
  props: Omit<Parameters<typeof Books>[0], "books"> & { userId: User["id"] }
) {
  const userBooks = useUserBooks(props.userId);
  const books = userBooks.data?.books ?? [];
  return <Books {...props} books={books} />;
}

function Index() {
  const router = useRouter();
  const session = useSession();
  const userId = session.data?.user?.id;
  const ltiResourceLink = session.data?.ltiResourceLink;
  const handleBookClick = (
    pathname: `/book${"" | "/edit"}`,
    query?: BookQuery | BookEditQuery
  ) => ({ id }: Pick<Book, "id">) => {
    router.push({ pathname, query: { ...query, bookId: id } });
  };
  const handlers = {
    onBookClick: handleBookClick("/book"),
    onBookEditClick: handleBookClick("/book/edit", { prev: "/books" }),
    onBookNewClick: () => router.push("/book/new"),
    onBookLinkClick: () => router.push("/link"),
  };

  if (userId == null) {
    return <Books books={[]} {...handlers} />;
  }

  return (
    <UserBooks
      userId={userId}
      ltiResourceLink={ltiResourceLink}
      {...handlers}
    />
  );
}

export default Index;
