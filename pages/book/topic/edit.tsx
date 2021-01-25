import { useRouter } from "next/router";
import type { TopicSchema } from "$server/models/topic";
import type {
  Query as BookQuery,
  ShowProps as BookShowProps,
} from "../../book";
import {
  Edit as TopicEdit,
  Query as TopicEditQuery,
  EditProps as TopicEditProps,
} from "../../topic/edit";
import Placeholder from "$templates/Placeholder";
import Unknown from "$templates/Unknown";
import { useBook } from "$utils/book";
import { updateBook } from "$utils/book";

type Query = BookQuery &
  TopicEditQuery & {
    prev?: string;
  };

type EditProps = BookShowProps & TopicEditProps;

function Edit({ bookId, ...props }: EditProps) {
  const book = useBook(bookId);
  async function handleDelete({ id: topicId }: Pick<TopicSchema, "id">) {
    if (!book) return;
    await updateBook({
      ...book,
      ltiResourceLinks: undefined,
      sections: book?.sections?.map((section) => ({
        ...section,
        topics: section.topics.filter(({ id }) => id !== topicId),
      })),
    });
  }

  if (!book) return <Placeholder />;

  return <TopicEdit {...props} onDelete={handleDelete} />;
}

function Router() {
  const router = useRouter();
  const query: Query = router.query;
  const props = {
    bookId: Number(query.bookId),
    topicId: Number(query.topicId),
  };
  function backToBook() {
    return router.push({ pathname: "/book", query: { bookId: props.bookId } });
  }
  function backToTopicImport() {
    const bookEditQuery = {
      bookId: props.bookId,
      ...(query.prev && { prev: query.prev }),
    };
    return router.push({
      pathname: "/book/topic/import",
      query: bookEditQuery,
    });
  }

  if (![props.bookId, props.topicId].every(Number.isFinite)) {
    return (
      <Unknown header="トピックがありません">
        トピックが見つかりませんでした
      </Unknown>
    );
  }

  return <Edit {...props} back={query.prev ? backToTopicImport : backToBook} />;
}

export default Router;
