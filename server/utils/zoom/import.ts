import fs from "node:fs";
import path from "node:path";
import stream from "node:stream/promises";
import got from "got";
import format from "date-fns/format";
import utcToZoneTime from "date-fns-tz/utcToZonedTime";

import prisma from "$server/utils/prisma";
import type { Prisma, User, Book, ZoomMeeting } from "@prisma/client";
import type { UserSettingsProps } from "$server/models/userSettings";
import { findUserByEmailAndLtiConsumerId } from "$server/utils/user";
import keywordsConnectOrCreateInput from "$server/utils/keyword/keywordsConnectOrCreateInput";
import { validateWowzaSettings } from "$server/utils/wowza/env";
import { startWowzaUpload } from "$server/utils/wowza/upload";
import type { WowzaUpload } from "$server/utils/wowza/upload";
import { findZoomMeeting } from "$server/utils/zoom/findZoomMeeting";
import upsertPublicBooks from "$server/utils/publicBook/upsertPublicBooks";
import {
  API_BASE_PATH,
  ZOOM_IMPORT_CONSUMER_KEY,
  ZOOM_IMPORT_WOWZA_BASE_URL,
  ZOOM_IMPORT_TO,
  ZOOM_IMPORT_AUTODELETE,
  ZOOM_IMPORT_DISABLE_AUTOPUBLIC,
  ZOOM_IMPORT_PUBLIC_DEFAULT_DOMAINS,
} from "$server/utils/env";

import type {
  ZoomMeetingResponse,
  ZoomRecordingsListResponse,
  ZoomUsersResponse,
} from "$server/utils/zoom/api";
import {
  zoomRequestToken,
  zoomRequest,
  zoomListRequest,
} from "$server/utils/zoom/api";
import { logger } from "$server/utils/zoom/env";

export async function zoomImport() {
  const uploadEnabled =
    ZOOM_IMPORT_TO == "wowza" && validateWowzaSettings(false);
  if (!uploadEnabled) return;

  const zoomUsers = (await zoomListRequest("/users", "users", {
    page_size: 300,
  })) as ZoomUsersResponse["users"];
  for (const zoomUser of zoomUsers) {
    const user = await findUserByEmailAndLtiConsumerId(
      zoomUser.email,
      ZOOM_IMPORT_CONSUMER_KEY
    );
    if (!user) continue;
    const settings = user.settings as UserSettingsProps;
    if (!settings?.zoomImportEnabled) continue;
    const wowzaUpload = await startWowzaUpload(user.ltiConsumerId, user.id);
    const tmpdir = await fs.promises.mkdtemp("/tmp/zoom-import-");
    await new ZoomImport(
      zoomUser.id,
      zoomUser.created_at,
      user,
      wowzaUpload,
      tmpdir,
      getDefaultDomains()
    ).importBooks();
  }
}

function getDefaultDomains() {
  return ZOOM_IMPORT_PUBLIC_DEFAULT_DOMAINS.split(",")
    .map((domain) => getDomainFromInput(domain))
    .filter((domain) => domain.length);
}

function getDomainFromInput(newDomain: string) {
  const trimmed = newDomain.trim();
  try {
    const host = new URL(trimmed).host;
    return host ? host : trimmed;
  } catch (e) {
    return trimmed;
  }
}

class ZoomImport {
  zoomUserId: string;
  createdAt: string;
  user: User;
  wowzaUpload: WowzaUpload;
  tmpdir: string;
  provider: string;
  publicBookDomains: string[];

  constructor(
    zoomUserId: string,
    createdAt: string,
    user: User,
    wowzaUpload: WowzaUpload,
    tmpdir: string,
    publicBookDomains: string[]
  ) {
    this.zoomUserId = zoomUserId;
    this.createdAt = createdAt;
    this.user = user;
    this.wowzaUpload = wowzaUpload;
    this.tmpdir = tmpdir;
    this.publicBookDomains = publicBookDomains;
    this.provider = ZOOM_IMPORT_TO == "wowza" ? "https://www.wowza.com/" : "";
  }

  async importBooks() {
    try {
      const meetings = (await zoomListRequest(
        `/users/${this.zoomUserId}/recordings`,
        "meetings",
        { page_size: 300, from: this.fromDate() }
      )) as ZoomRecordingsListResponse["meetings"];
      meetings.sort((a, b) => a.start_time.localeCompare(b.start_time));

      const transactions = [];
      const deletemeetings = [];
      for (const meeting of meetings) {
        const data = await this.getBook(meeting);
        if (data && data.book && data.zoomMeeting) {
          transactions.push(
            prisma.book.create({
              data: {
                ...data.book,
                node: { create: {} },
              },
            })
          );
          transactions.push(
            prisma.zoomMeeting.create({ data: data.zoomMeeting })
          );
          if (ZOOM_IMPORT_AUTODELETE) deletemeetings.push(meeting.uuid);
        }
      }
      if (!transactions.length) return;

      await this.wowzaUpload.upload();
      const results = await prisma.$transaction(transactions);
      if (!ZOOM_IMPORT_DISABLE_AUTOPUBLIC)
        await prisma.$transaction(this.getPublicBooks(results));
      for (const deletemeeting of deletemeetings) {
        await zoomRequest(
          `/meetings/${deletemeeting}/recordings`,
          { action: "trash" },
          "DELETE"
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger("ERROR", `${e.toString()}: email:${this.user.email}`, e);
    } finally {
      await this.cleanUp();
    }
  }

  async getBook(meeting: ZoomRecordingsListResponse["meetings"][number]) {
    const data = await this.getTopic(meeting);
    if (data && data.topic && data.zoomMeeting) {
      const { topic, zoomMeeting } = data;
      const topicSections = [{ order: 0, topic: { create: topic } }];
      const sections = [{ order: 0, topicSections: { create: topicSections } }];
      const book = {
        name: topic.name,
        description: topic.description,
        timeRequired: topic.timeRequired,
        shared: false,
        zoomMeetingId: ZOOM_IMPORT_DISABLE_AUTOPUBLIC ? null : meeting.id,
        authors: { create: { userId: this.user.id, roleId: 1 } },
        sections: { create: sections },
        details: {},
        ltiResourceLinks: {},
      };
      return { book, zoomMeeting };
    }
    return;
  }

  getPublicBooks(results: (Book | ZoomMeeting)[]) {
    const transactions = [];
    for (const result of results) {
      if ("id" in result) {
        const { id: bookId } = result as Book;
        const publicBook = {
          id: 0,
          bookId,
          userId: this.user.id,
          domains: this.publicBookDomains,
          expireAt: null,
          token: "",
        };
        transactions.push(
          ...upsertPublicBooks(this.user.id, bookId, [publicBook])
        );
      }
    }
    return transactions;
  }

  async getTopic(meeting: ZoomRecordingsListResponse["meetings"][number]) {
    try {
      const importedResource = await findZoomMeeting(meeting.uuid);
      if (importedResource) return;

      const { downloadUrl, fileId } = this.getDownloadUrl(meeting);
      if (!downloadUrl || !fileId) return;

      const startTime = new Date(meeting.start_time);
      const file = path.join(this.tmpdir, `${fileId}.mp4`);
      const fileStream = got
        .stream(`${downloadUrl}?access_token=${zoomRequestToken()}`)
        .pipe(fs.createWriteStream(file));
      await stream.finished(fileStream);

      const video = {
        create: {
          providerUrl: this.provider,
        },
      };

      const uploadpath = await this.wowzaUpload.moveFileToUpload(
        file,
        startTime
      );
      const url = `${ZOOM_IMPORT_WOWZA_BASE_URL}${API_BASE_PATH}/wowza${uploadpath}`;
      const resource = {
        connectOrCreate: {
          create: {
            video,
            url,
            details: {},
          },
          where: { url },
        },
      };

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const datetimeForTitle = format(
        utcToZoneTime(startTime, timezone),
        "yyyy/MM/dd HH:mm"
      );
      const meetingDetail = await this.getMeetingDetail(meeting);
      const topic: Prisma.TopicCreateInput = {
        name: `📽 ${meeting.topic} ${datetimeForTitle}`,
        description: meetingDetail.agenda,
        timeRequired: meeting.duration * 60,
        authors: { create: { userId: this.user.id, roleId: 1 } },
        keywords: keywordsConnectOrCreateInput([{ name: "Zoom" }]),
        createdAt: startTime,
        updatedAt: new Date(),
        shared: false,
        resource,
        details: {},
      };

      const zoomMeeting = {
        uuid: meeting.uuid,
        resource,
      };

      return { topic, zoomMeeting };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger(
        "ERROR",
        `${e.toString()}: email:${this.user.email} meeting.uuid:${
          meeting.uuid
        }`,
        e
      );
      return;
    }
  }

  getDownloadUrl(meeting: ZoomRecordingsListResponse["meetings"][number]) {
    const recordingFiles = meeting.recording_files;
    const file =
      recordingFiles.find(
        (file) =>
          file.file_type == "MP4" &&
          file.recording_type == "shared_screen_with_speaker_view(CC)"
      ) ||
      recordingFiles.find(
        (file) =>
          file.file_type == "MP4" &&
          file.recording_type == "shared_screen_with_speaker_view"
      ) ||
      recordingFiles.find(
        (file) =>
          file.file_type == "MP4" && file.recording_type == "speaker_view"
      ) ||
      recordingFiles.find(
        (file) =>
          file.file_type == "MP4" &&
          file.recording_type == "shared_screen_with_gallery_view"
      ) ||
      recordingFiles.find(
        (file) =>
          file.file_type == "MP4" && file.recording_type == "gallery_view"
      ) ||
      recordingFiles.find(
        (file) =>
          file.file_type == "MP4" && file.recording_type == "shared_screen"
      );
    return { downloadUrl: file?.download_url, fileId: file?.id };
  }

  async getMeetingDetail(meeting: {
    id: number;
  }): Promise<ZoomMeetingResponse | { agenda: "" }> {
    try {
      return (await zoomRequest(
        `/meetings/${meeting.id}`
      )) as ZoomMeetingResponse;
    } catch (e) {
      return { agenda: "" };
    }
  }

  fromDate() {
    const date = new Date(this.createdAt);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  async cleanUp() {
    if (this.wowzaUpload) await this.wowzaUpload.cleanUp();
    await fs.promises.rm(this.tmpdir, { recursive: true });
  }
}
