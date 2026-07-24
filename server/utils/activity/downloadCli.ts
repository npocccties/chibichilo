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
import findClient from "../ltiv1p3/findClient";
import { getMemberships } from "../ltiv1p3/services";
import type { LtiContextSchema } from "$server/models/ltiContext";
import { updateLtiMembers } from "../ltiMembers";

let administrator: boolean = true;

async function getContexts(): Promise<LtiContextSchema[]> {
  const contexts = await prisma.ltiContext.findMany({});
  return contexts;
}

//
// download activity data for all courses
//
async function getDecoratedData(consumerId: string, contextId: string) {
  const session = JSON.parse(JSON.stringify(nullSession)) as SessionSchema;
  session.oauthClient.id = consumerId;
  session.ltiContext.id = contextId;
  session.ltiRoles = [
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
    "http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator",
  ];

  const activity = await findAllActivity(
    session,
    true,
    consumerId,
    contextId,
    administrator
  );
  activity.learners = [];
  activity.courseBooks = [];

  const activityRewatchRate = NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD
    ? await getActivityRewatchRate(
        session,
        {
          current_lti_context_only: true,
          lti_consumer_id: consumerId,
          lti_context_id: contextId,
        },
        administrator
      )
    : undefined;

  const decoratedData = download(
    activity.bookActivities,
    session,
    activityRewatchRate
  );

  return decoratedData;
}

const deleteList = ["ユーザ名", "メールアドレス"];

function writeCsv(
  decoratedData: ReturnType<typeof download>,
  filename: string
) {
  if (!decoratedData || decoratedData.length === 0) {
    throw new Error("No data to write to CSV");
  }
  const filterd = decoratedData.map((d) => {
    for (const key of deleteList) {
      delete d[key];
    }
    return d;
  });
  const csv = json2csv.parse(filterd);
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

async function do_download(filename: string) {
  let exitCode = 1;

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
      contexts.map(async ({ consumerId, id }) =>
        consumerId ? await getDecoratedData(consumerId, id) : []
      )
    );
    writeCsv(list.flat(), filename);
    exitCode = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    logger("ERROR", e.toString());
  } finally {
    logger("INFO", "end activity download...");
    await prisma.$disconnect();
    process.exit(exitCode);
  }
}

//
// sync members for all courses
//
async function syncContext(context: LtiContextSchema) {
  const { consumerId, id, contextMembershipsUrl } = context;
  if (!consumerId || !id || !contextMembershipsUrl) {
    throw new Error(`Invalid context`);
  }
  const session = JSON.parse(JSON.stringify(nullSession)) as SessionSchema;
  session.oauthClient.id = consumerId;
  session.ltiContext.id = id;

  const client = await findClient(consumerId);
  if (!client) {
    throw new Error(`Client not found for consumerId: ${consumerId}`);
  }
  const membership = await getMemberships(client, contextMembershipsUrl);
  if (membership) {
    await updateLtiMembers(
      consumerId,
      id,
      context.title,
      context.label,
      membership.members,
      administrator
    );
  }
}

async function do_sync() {
  let exitCode = 1;

  logger("INFO", `sync members...`);
  try {
    logger("INFO", "begin sync members...");
    const contexts = (await getContexts()).filter(
      ({ consumerId, id, contextMembershipsUrl }) =>
        consumerId && id && contextMembershipsUrl
    );
    for (const context of contexts) {
      logger(
        "INFO",
        `processing context ${context.consumerId} ${context.id} ${context.title}...`
      );
      await syncContext(context);
    }
    exitCode = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    logger("ERROR", e.toString());
  } finally {
    logger("INFO", "end sync members...");
    await prisma.$disconnect();
    process.exit(exitCode);
  }
}

async function usage() {
  console.log("Usage:");
  console.log(
    "  node dist/downloadCli.js -s|--sync               # 受講者リストを取得する"
  );
  console.log(
    "  node dist/downloadCli.js -o|--output <filename>  # 活動ログをCSVで出力する"
  );
  console.log(
    "  node dist/downloadCli.js --sync-no-administrator # LtiMembers を使用する"
  );
  console.log(
    "  node dist/downloadCli.js --output-no-administrator <filename>  # LtiMembers を使用する"
  );
}

async function main() {
  dotenv.config();

  const arg = process.argv[2];
  switch (arg) {
    case "--sync":
    case "-s":
      await do_sync();
      break;
    case "--sync-no-administrator":
      administrator = false;
      await do_sync();
      break;
    case "--output":
    case "-o":
      await do_download(process.argv[3]);
      break;
    case "--output-no-administrator":
      administrator = false;
      await do_download(process.argv[3]);
      break;
    case "--help":
    case "-h":
    default:
      await usage();
      process.exit(0);
  }
}

void main();
