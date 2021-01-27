import { useRouter } from "next/router";
import BookImport from "$templates/BookImport";
import Placeholder from "$templates/Placeholder";
import Unknown from "$templates/Unknown";
import { updateBook, useBook } from "$utils/book";
import { useSession } from "$utils/session";
import { useBooks } from "$utils/books";
import type { BookSchema } from "$server/models/book";
import type { SectionSchema } from "$server/models/book/section";
import type { TopicSchema } from "$server/models/topic";
import type { UserSchema } from "$server/models/user";
import type { Query as BookEditQuery } from "../edit";
import bookCreateBy from "$utils/bookCreateBy";
import topicCreateBy from "$utils/topicCreateBy";
import { createTopic } from "$utils/topic";
import { pagesPath } from "$utils/$path";

export type Query = BookEditQuery;

const sharedOrCreatedBy = (author?: Pick<UserSchema, "id">) => (
  book: BookSchema
) => {
  return book.shared || bookCreateBy(book, author);
};

function Import({ bookId, prev }: Query) {
  const { data: session } = useSession();
  const book = useBook(bookId);
  const books = useBooks();
  const router = useRouter();
  const bookEditQuery = { bookId, ...(prev && { prev }) };
  async function handleSubmit({
    topics,
  }: {
    books: BookSchema[];
    sections: SectionSchema[];
    topics: TopicSchema[];
  }) {
    if (!book) return;

    const connectOrCreateTopics = topics.map(async (topic) => {
      if (!session?.user) return Promise.reject();
      if (topicCreateBy(topic, session.user)) return Promise.resolve(topic.id);
      // NOTE: 自身以外の作成したトピックに関しては影響を及ぼすのを避ける目的で複製
      return createTopic(topic).then(({ id }) => id);
    });
    const ids = await Promise.all(connectOrCreateTopics);
    await updateBook({
      ...book,
      ltiResourceLinks: undefined,
      sections: [...book.sections, ...ids.map((id) => ({ topics: [{ id }] }))],
    });

    return router.push(pagesPath.book.edit.$url({ query: { bookId } }));
  }
  function handleBookEditClick({ id: bookId }: Pick<BookSchema, "id">) {
    return router.push(
      pagesPath.book.edit.$url({
        query: { ...bookEditQuery, bookId },
      })
    );
  }
  function handleTopicEditClick({ id: topicId }: Pick<TopicSchema, "id">) {
    return router.push(
      pagesPath.book.import.topic.edit.$url({
        query: { ...bookEditQuery, topicId },
      })
    );
  }
  const handlers = {
    onSubmit: handleSubmit,
    onBookEditClick: handleBookEditClick,
    onTopicEditClick: handleTopicEditClick,
    isBookEditable: (book: BookSchema) =>
      // NOTE: 自身以外の作成したブックに関しては編集不可
      session?.user && book.author.id === session.user.id,
    isTopicEditable: (topic: TopicSchema) =>
      // NOTE: 自身以外の作成したトピックに関しては編集不可
      session?.user && topic.creator.id === session.user.id,
  };

  if (!book) return <Placeholder />;
  if (!books) return <Placeholder />;

  return (
    <BookImport
      books={books.filter(sharedOrCreatedBy(session?.user))}
      {...handlers}
    />
  );
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const { prev }: Pick<Query, "prev"> = router.query;

  if (!Number.isFinite(bookId))
    return (
      <Unknown header="ブックがありません">
        ブックが見つかりませんでした
      </Unknown>
    );

  return <Import bookId={bookId} prev={prev} />;
}

export default Router;
