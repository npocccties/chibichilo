import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { CourseBookSchema } from "$server/models/courseBook";
import { round } from "$server/utils/math";

function getActivitiesByBooksAndTopics({
  courseBooks,
  bookActivities,
}: {
  courseBooks: Array<CourseBookSchema>;
  bookActivities: Array<BookActivitySchema>;
}) {
  const activitiesByBooksAndTopics: Array<
    Pick<BookSchema, "id" | "name"> & {
      activitiesByTopics: Array<
        Pick<TopicSchema, "id" | "name" | "timeRequired"> & {
          averageCompleteRate: number;
        }
      >;
    }
  > = [];

  for (const book of courseBooks) {
    const activitiesByTopics: Array<
      Pick<TopicSchema, "id" | "name" | "timeRequired"> & {
        averageCompleteRate: number;
      }
    > = [];
    const topics: Array<Pick<TopicSchema, "id" | "name" | "timeRequired">> =
      book.sections.map((section) => section.topics).flat();
    for (const topic of topics) {
      const activities = bookActivities
        .filter(
          (a: BookActivitySchema) =>
            a.book.id === book.id && a.topic.id === topic.id
        )
        .filter(
          (obj, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.id === obj.id &&
                t.book.id === obj.book.id &&
                t.topic.id === obj.topic.id
            )
        );
      const averageCompleteRate = round(
        activities
          .map(
            (a: BookActivitySchema) =>
              (a?.totalTimeMs ?? 0) / 1000 / topic.timeRequired ?? 0
          )
          .reduce((a, b) => {
            return a + b;
          }, 0) / activities.length || 0,
        -3
      );

      activitiesByTopics.push({ ...topic, averageCompleteRate });
    }
    activitiesByBooksAndTopics.push({ ...book, activitiesByTopics });
  }

  return activitiesByBooksAndTopics;
}

export default getActivitiesByBooksAndTopics;
