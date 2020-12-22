import { User, Book } from "@prisma/client";
import { useRouter } from "$components/router";
import { useSession } from "$utils/session";
import { useUserBooks } from "$utils/userBooks";
import Books from "$templates/Books";

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
  const handleBookClick = (book: { id: Book["id"] }) => {
    router.push({
      pathname: "/book",
      query: { id: book.id },
    });
  };
  const handleBookNewClick = () => router.push("/book/new");

  if (userId == null) {
    return (
      <Books
        books={[]}
        onBookClick={handleBookClick}
        onBookNewClick={handleBookNewClick}
      />
    );
  } else {
    return (
      <UserBooks
        userId={userId}
        onBookClick={handleBookClick}
        onBookNewClick={handleBookNewClick}
      />
    );
  }
}

export default Index;
