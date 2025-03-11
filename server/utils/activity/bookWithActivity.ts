import type { SessionSchema } from "$server/models/session";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { CourseBookSchema } from "$server/models/courseBook";
import type { ActivitySchema } from "$server/models/activity";
import type { BookWithTopics } from "$server/utils/book/bookToBookSchema";
import { bookToBookSchema } from "$server/utils/book/bookToBookSchema";
import { getDisplayableBook } from "$server/utils/displayableBook";
import contentBy from "$server/utils/contentBy";
import isCompleted from "./isCompleted";
import { isInstructor } from "$server/utils/session";

function bookToCourseBook(session: SessionSchema, book: BookWithTopics) {
  const courseBook = getDisplayableBook(
    bookToBookSchema(book),
    (content) => contentBy(content, session.user),
    undefined,
    undefined,
    isInstructor(session)
  );

  return courseBook;
}

/** BookActivitySchema への変換 */
export function toSchema({
  session,
  books,
  activities,
}: {
  session: SessionSchema;
  books: Array<BookWithTopics>;
  activities: Array<
    Pick<
      ActivitySchema,
      "learner" | "topic" | "totalTimeMs" | "createdAt" | "updatedAt"
    >
  >;
}): {
  courseBooks: Array<CourseBookSchema>;
  bookActivities: Array<BookActivitySchema>;
} {
  const courseBooks = books.flatMap((book) => {
    const courseBook = bookToCourseBook(session, book);
    return courseBook ? [courseBook] : [];
  });
  const bookActivities = courseBooks.flatMap((book) =>
    book.sections.flatMap(({ topics }) =>
      topics.flatMap((topic) =>
        activities.flatMap((activity) => {
          if (!isInstructor(session) || activity.topic.id !== topic.id)
            return [];
          return [
            {
              ...activity,
              book: { id: book.id, name: book.name },
              status: isCompleted(topic, activity)
                ? ("completed" as const)
                : ("incompleted" as const),
            },
          ];
        })
      )
    )
  );

  return { courseBooks, bookActivities };
}
