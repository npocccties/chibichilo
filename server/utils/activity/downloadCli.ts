import dotenv from "dotenv";
import fs from "fs";

import format from "date-fns/format";
import utcToZoneTime from "date-fns-tz/utcToZonedTime";
import prisma from "$server/utils/prisma";
import { nullSession } from "$server/services/session";
import findAllActivity from "./findAllActivity";
import getLocaleEntries from "$utils/bookLearningActivity/getLocaleEntries";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { SessionSchema } from "$server/models/session";
import { getActivityRewatchRate } from "$server/services/activityRewatchRate";
import type { ActivityRewatchRateProps } from "$server/validators/activityRewatchRate";
import json2csv from "json2csv";

import { NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD } from "$utils/env";

async function getContexts() {
  const contexts = await prisma.ltiContext.findMany({});
  return contexts;
}

async function getDecoratedData(consumerId: string, contextId: string) {
  const session = JSON.parse(JSON.stringify(nullSession)) as SessionSchema;
  session.oauthClient.id = consumerId;
  session.ltiContext.id = contextId;
  session.ltiRoles = [
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
    "http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator",
  ];

  const activity = await findAllActivity(session, true, consumerId, contextId);
  activity.learners = [];
  activity.courseBooks = [];

  const activityRewatchRate = NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD
    ? await getActivityRewatchRate(session, {
        current_lti_context_only: true,
        lti_consumer_id: consumerId,
        lti_context_id: contextId,
      })
    : undefined;

  const decoratedData = download(
    activity.bookActivities,
    session,
    activityRewatchRate
  );

  return decoratedData;
}

function writeCsv(
  decoratedData: ReturnType<typeof download>,
  filename: string
) {
  if (!decoratedData) return;
  const csv = json2csv.parse(decoratedData);
  const bom = "\uFEFF";
  fs.writeFileSync(filename, bom + csv, "utf-8");
}

//
// utils/bookLearningActivity/download.ts download 関数を CLI 用に変更
//
function download(
  data: BookActivitySchema[],
  session: SessionSchema,
  activityRewatchRate: ActivityRewatchRateProps[] | undefined
) {
  if (data.length === 0) return [];

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
        activityRewatchRate
          ? activityRewatchRate.find(
              (r) => r.learnerId === a.learner.id && r.topicId === a.topic.id
            )
          : undefined,
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

  const filename = process.argv[2];
  if (filename) {
    logger("INFO", `output file: ${filename}`);
  } else {
    logger("ERROR", "output file is required");
    process.exit(exitCode);
  }
  try {
    logger("INFO", "begin activity download...");
    const contexts = (await getContexts()).filter(
      ({ consumerId, id }) => consumerId && id
    );
    const list = await Promise.all(
      contexts.map(
        async ({ consumerId, id }) => await getDecoratedData(consumerId, id)
      )
    );
    writeCsv(list.flat(), filename);
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
