import { useRouter } from "next/router";
import { BookSchema } from "$server/models/book";
import { useNextItemIndexAtom } from "$store/book";
import Book from "$templates/Book";
import Placeholder from "$templates/Placeholder";
import Unknown from "$templates/Unknown";
import { useBook } from "$utils/book";
import { isInstructor, useSession } from "$utils/session";
import { TopicSchema } from "$server/models/topic";
import { pagesPath } from "$utils/$path";

export type Query = { bookId: BookSchema["id"] };

function Show(query: Query) {
  const { data: session } = useSession();
  const book = useBook(query.bookId);
  const [index, nextItemIndex] = useNextItemIndexAtom();
  const handleTopicEnded = () => nextItemIndex();
  const handleItemClick = nextItemIndex;
  const router = useRouter();
  const handleBookEditClick = () => {
    return router.push(pagesPath.book.edit.$url({ query }));
  };
  const handleBookLinkClick = () => router.push(pagesPath.link.$url());
  const handleTopicEditClick = ({ id }: Pick<TopicSchema, "id">) => {
    return router.push(
      pagesPath.book.topic.edit.$url({
        query: {
          bookId: query.bookId,
          topicId: id,
        },
      })
    );
  };

  if (!book) return <Placeholder />;

  return (
    <Book
      editable={session && isInstructor(session)}
      book={book}
      index={index}
      onBookEditClick={handleBookEditClick}
      onBookLinkClick={handleBookLinkClick}
      onTopicEditClick={handleTopicEditClick}
      onTopicEnded={handleTopicEnded}
      onItemClick={handleItemClick}
    />
  );
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);

  if (!Number.isFinite(bookId))
    return (
      <Unknown header="ブックがありません">
        ブックが見つかりませんでした
      </Unknown>
    );

  return <Show bookId={bookId} />;
}

export default Router;
