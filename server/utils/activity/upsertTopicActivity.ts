import type { User, Book, Topic } from "@prisma/client";
import type { ActivityProps } from "$server/validators/activityProps";
import upsertActivity from "./upsertActivity";

/** トピックでの学習活動の挿入 */
function upsertTopicActivity({
  learnerId,
  bookId,
  topicId,
  activity,
}: {
  learnerId: User["id"];
  bookId: Book["id"];
  topicId: Topic["id"];
  activity: ActivityProps;
}) {
  return upsertActivity({
    learnerId,
    bookId,
    topicId,
    ltiConsumerId: "",
    ltiContextId: "",
    activity,
  });
}

export default upsertTopicActivity;
