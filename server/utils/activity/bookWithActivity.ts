import type { SessionSchema } from "$server/models/session";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { LearnerSchema } from "$server/models/learner";
import type { CourseBookSchema } from "$server/models/courseBook";
import type { ActivitySchema } from "$server/models/activity";
import type { BookWithTopics } from "$server/utils/book/bookToBookSchema";
import { bookToBookSchema } from "$server/utils/book/bookToBookSchema";
import { getDisplayableBook } from "$server/utils/displayableBook";
import contentBy from "$server/utils/contentBy";
import isCompleted from "./isCompleted";
import { isInstructor } from "$server/utils/session";
import type { LtiContextSchema } from "$server/models/ltiContext";

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
  learners,
  ltiConsumerId,
  ltiContext,
  isDownloadPage = false,
}: {
  session: SessionSchema;
  books: Array<BookWithTopics>;
  activities: Array<
    Pick<
      ActivitySchema,
      "learner" | "topic" | "totalTimeMs" | "createdAt" | "updatedAt"
    >
  >;
  learners: Array<LearnerSchema>;
  ltiConsumerId: string | undefined;
  ltiContext: LtiContextSchema | undefined;
  isDownloadPage: boolean;
}): {
  courseBooks: Array<CourseBookSchema>;
  bookActivities: Array<BookActivitySchema>;
} {
  const courseBooks = books.flatMap((book) => {
    const courseBook = isDownloadPage
      ? getDisplayableBook(
          bookToBookSchema(book),
          () => true,
          undefined,
          undefined,
          isInstructor(session)
        )
      : bookToCourseBook(session, book);
    return courseBook ? [courseBook] : [];
  });

  const bookActivities = courseBooks.flatMap((book) =>
    book.sections.flatMap(({ topics }) =>
      topics.flatMap((topic) => {
        const watchedActivities = activities.flatMap((activity) => {
          if (activity.topic.id !== topic.id) return [];

          return [
            {
              ...activity,
              book: { id: book.id, name: book.name },
              status: isCompleted(topic, activity)
                ? ("completed" as const)
                : ("incompleted" as const),
            },
          ];
        }) as Array<BookActivitySchema>;

        const watchedLearnerIds = watchedActivities.flatMap(
          (activity) => activity.learner.id
        );
        const unwatchedLearners = learners.filter(
          (learner) => !watchedLearnerIds.find((id) => id === learner.id)
        );
        const unwatchedActivities = unwatchedLearners.flatMap((learner) => {
          return {
            id: 0,
            topicId: topic.id,
            learnerId: learner.id,
            ltiConsumerId: ltiConsumerId,
            ltiContextId: ltiContext?.id ?? "",
            totalTimeMs: 0,
            createdAt: undefined,
            updatedAt: undefined,
            ltiContext: ltiContext,
            learner: {
              id: learner.id,
              name: learner.name,
              email: learner.email,
              ltiUserId: learner.ltiUserId,
              ltiConsumerId: ltiConsumerId,
            },
            topic: {
              id: topic.id,
              name: topic.name,
              timeRequired: topic.timeRequired,
            },
            book: { id: book.id, name: book.name },
            status: "unopened",
          };
        }) as Array<BookActivitySchema>;
        return watchedActivities.concat(unwatchedActivities);
      })
    )
  );

  return { courseBooks, bookActivities };
}
