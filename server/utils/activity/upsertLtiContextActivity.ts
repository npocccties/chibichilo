import type {
  User,
  Book,
  Topic,
  LtiConsumer,
  LtiContext,
} from "@prisma/client";
import type { ActivityProps } from "$server/validators/activityProps";
import upsertActivity from "./upsertActivity";

/** コースごとのトピックでの学習活動の挿入 */
function upsertLtiContextActivity({
  learnerId,
  bookId,
  topicId,
  ltiConsumerId,
  ltiContextId,
  activity,
}: {
  learnerId: User["id"];
  bookId: Book["id"];
  topicId: Topic["id"];
  ltiConsumerId: LtiConsumer["id"];
  ltiContextId: LtiContext["id"];
  activity: ActivityProps;
}) {
  return upsertActivity({
    learnerId,
    bookId,
    topicId,
    ltiConsumerId,
    ltiContextId,
    activity,
  });
}

export default upsertLtiContextActivity;
