import dotenv from "dotenv";

import format from "date-fns/format";
import utcToZoneTime from "date-fns-tz/utcToZonedTime";
import prisma from "$server/utils/prisma";
import { nullSession } from "$server/services/session";
import findAllActivity from "./findAllActivity";
import { isAdministrator, isInstructor } from "$utils/session";
import getLocaleEntries from "$utils/bookLearningActivity/getLocaleEntries";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { SessionSchema } from "$server/models/session";
import { getActivityRewatchRate } from "$server/services/activityRewatchRate";
import type { ActivityRewatchRateProps } from "$server/validators/activityRewatchRate";

async function test() {
  const consumers = await prisma.ltiConsumer.findMany({});
  console.log("consumers", JSON.stringify(consumers, null, 2));

  const contexts = await prisma.ltiContext.findMany({});
  console.log("contexts", JSON.stringify(contexts, null, 2));

  const session = { ...nullSession };
  session.oauthClient.id = consumers[1]?.id ?? "";
  session.ltiContext.id = contexts[1]?.id ?? "";
  session.ltiRoles = [
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
    "http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator",
  ];

  console.log("session", JSON.stringify(session, null, 2));
  console.log("isInstructor", isInstructor(session));
  console.log("isAdministrator", isAdministrator(session));

  const activity = await findAllActivity(
    session,
    true,
    session.oauthClient.id,
    session.ltiContext.id
  );
  activity.learners = [];
  activity.courseBooks = [];
  console.log("activity", JSON.stringify(activity, null, 2));

  const activityRewatchRate = await getActivityRewatchRate(session, {
    current_lti_context_only: true,
    lti_consumer_id: session.oauthClient.id,
    lti_context_id: session.ltiContext.id,
  });
  console.log(
    "activityRewatchRate",
    JSON.stringify(activityRewatchRate, null, 2)
  );

  const decoratedData = download(
    activity.bookActivities,
    session,
    activityRewatchRate
  );
  console.log("decoratedData", JSON.stringify(decoratedData, null, 2));
}

function download(
  data: BookActivitySchema[],
  session: SessionSchema,
  activityRewatchRate: ActivityRewatchRateProps[]
) {
  if (data.length === 0) return;

  //  const rewatchRate = NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD
  //    ? await fetchRewatchRate({ currentLtiContextOnly })
  //    : undefined;

  const decoratedData = data
    .filter(
      (obj, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.ltiContext &&
            obj.ltiContext &&
            t.ltiContext.id === obj.ltiContext.id &&
            t.learner.id === obj.learner.id &&
            t.book.id === obj.book.id &&
            t.topic.id === obj.topic.id
        )
    )
    .map((a) =>
      getLocaleEntries(
        a,
        (activityRewatchRate ?? []).find(
          (r) => r.learnerId === a.learner.id && r.topicId === a.topic.id
        ) ?? undefined,
        session
      )
    );
  return decoratedData;
}

function logger(level: string, output: string, error?: Error | unknown) {
  console.log(
    format(utcToZoneTime(new Date(), "Asia/Tokyo"), "yyyy-MM-dd HH:mm:ss"),
    level,
    output,
    "ActivityDownloadLog"
  );
  if (error instanceof Error) console.log(error.stack);
}

async function main() {
  dotenv.config();
  let exitCode = 1;

  try {
    logger("INFO", "begin activity download...");
    await test();
    exitCode = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    logger("ERROR", e.toString(), e);
  } finally {
    logger("INFO", "end activity download...");
    await prisma.$disconnect();
    process.exit(exitCode);
  }
}

void main();
