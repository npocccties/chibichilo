import { createId } from '@paralleldrive/cuid2';
import type { Book, Topic } from '@prisma/client';
import prisma from './prisma';

export type UniqueIds = Pick<Book, "poid" | "oid" | "pid" | "vid">;

export const selectUniqueIds = {
  poid: true,
  oid: true,
  pid: true,
  vid: true,
};

function generateUniqueIds(ids: UniqueIds) {
  ids.poid = createId();
  ids.oid = ids.poid;
  ids.pid = "";
  ids.vid = "";
}

function releaseUniqueIds(orig: UniqueIds, release: UniqueIds) {
  if (!orig.poid) {
    generateUniqueIds(orig);
  }
  release.poid = orig.poid;
  release.oid = orig.oid;
  release.pid = orig.pid;
  release.vid = createId();
  orig.pid = release.vid;
}

function cloneUniqueIds(orig: UniqueIds, clone: UniqueIds) {
  if (!orig.poid) {
    generateUniqueIds(orig);
  }
  clone.poid = orig.poid;
  clone.oid = createId();
  clone.pid = orig.vid;
  clone.vid = "";
}

export async function findBookUniqueIds(
  bookId: Book["id"]
): Promise<UniqueIds | undefined> {
  const ret = await prisma.book.findUnique({
    where: { id: bookId},
    select: selectUniqueIds,
  });
  if (ret == null) return;
  return ret;
}

async function updateBookUniqueIds(
  bookId: Book["id"],
  ids: UniqueIds
): Promise<void> {
  const _updated = await prisma.book.update({
    where: { id: bookId},
    data: ids
  });
}

export async function releaseBookUniqueIds(
  origId: Book["id"],
  releaseId: Book["id"]
): Promise<void> {
  const orig = await findBookUniqueIds(origId);
  const release = await findBookUniqueIds(releaseId);
  if (!orig || !release) return;

  releaseUniqueIds(orig, release);

  await updateBookUniqueIds(origId, orig);
  await updateBookUniqueIds(releaseId, release);

  return;
}

export async function cloneBookUniqueIds(
  origId: Book["id"],
  cloneId: Book["id"]
): Promise<void> {
  const orig = await findBookUniqueIds(origId);
  const clone = await findBookUniqueIds(cloneId);
  if (!orig || !clone) return;

  cloneUniqueIds(orig, clone);

  await updateBookUniqueIds(origId, orig);
  await updateBookUniqueIds(cloneId, clone);

  return;
}

export async function findTopicUniqueIds(
  topicId: Topic["id"]
): Promise<UniqueIds | undefined> {
  const ret = await prisma.topic.findUnique({
    where: { id: topicId},
    select: selectUniqueIds,
  });
  if (ret == null) return;
  return ret;
}

async function updateTopicUniqueIds(
  topicId: Topic["id"],
  ids: UniqueIds
): Promise<void> {
  const _updated = await prisma.topic.update({
    where: { id: topicId},
    data: ids
  });
}

export async function releaseTopicUniqueIds(
  origId: Topic["id"],
  releaseId: Topic["id"]
): Promise<void> {
  const orig = await findTopicUniqueIds(origId);
  const release = await findTopicUniqueIds(releaseId);
  if (!orig || !release) return;

  releaseUniqueIds(orig, release);

  await updateTopicUniqueIds(origId, orig);
  await updateTopicUniqueIds(releaseId, release);

  return;
}

export async function cloneTopicUniqueIds(
  origId: Topic["id"],
  cloneId: Topic["id"]
): Promise<void> {
  const orig = await findTopicUniqueIds(origId);
  const clone = await findTopicUniqueIds(cloneId);
  if (!orig || !clone) return;

  cloneUniqueIds(orig, clone);

  await updateTopicUniqueIds(origId, orig);
  await updateTopicUniqueIds(cloneId, clone);

  return;
}
