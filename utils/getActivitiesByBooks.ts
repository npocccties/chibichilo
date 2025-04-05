import type { BookSchema } from "$server/models/book";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { CourseBookSchema } from "$server/models/courseBook";
import type { LearnerSchema } from "$server/models/learner";

function getActivitiesByBooks({
  courseBooks,
  bookActivities,
}: {
  courseBooks: Array<CourseBookSchema>;
  bookActivities: Array<BookActivitySchema>;
}) {
  const activitiesByBooks: Array<
    Pick<BookSchema, "id" | "name"> & {
      completedLearners: Map<LearnerSchema["id"], Array<BookActivitySchema>>;
      incompletedLearners: Map<LearnerSchema["id"], Array<BookActivitySchema>>;
    }
  > = [];
  for (const book of courseBooks) {
    const topicIds = new Set(
      book.sections.flatMap(({ topics }) => topics).map(({ id }) => id)
    );
    const activities = bookActivities.filter((a) => a.book.id === book.id);
    const learnerIds = new Set(activities.map((a) => a.learner.id));
    const completedLearners: Map<
      LearnerSchema["id"],
      Array<BookActivitySchema>
    > = new Map();
    const incompletedLearners: Map<
      LearnerSchema["id"],
      Array<BookActivitySchema>
    > = new Map();
    for (const learnerId of learnerIds) {
      const activitiesByLearner = activities.filter(
        (a) => a.learner.id === learnerId
      );
      if (
        activitiesByLearner.length === topicIds.size &&
        activitiesByLearner.every(({ status }) => status === "completed")
      ) {
        completedLearners.set(learnerId, activitiesByLearner);
      } else if (
        activitiesByLearner.every(({ status }) => status === "incompleted")
      ) {
        incompletedLearners.set(learnerId, activitiesByLearner);
      }
    }
    activitiesByBooks.push({ ...book, completedLearners, incompletedLearners });
  }
  return activitiesByBooks;
}

export default getActivitiesByBooks;
