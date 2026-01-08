import { createId } from '@paralleldrive/cuid2';
import type { Book, Topic } from '@prisma/client';
import prisma from './prisma';

export type UniqueIds = Pick<Book, "poid" | "oid" | "pid" | "vid" | "spid">;

export const selectUniqueIds = {
  poid: true,
  oid: true,
  pid: true,
  vid: true,
  spid: true,
};

function generateUniqueIds(ids: UniqueIds) {
  ids.poid = createId();
  ids.oid = ids.poid;
  ids.pid = "";
  ids.vid = "";
  ids.spid = "";
}

function releaseUniqueIds(edit: UniqueIds, release: UniqueIds) {
  if (!edit.poid) {
    generateUniqueIds(edit);
  }
  release.poid = edit.poid;
  release.oid = edit.oid;
  release.pid = edit.pid;
  release.vid = createId();
  release.spid = edit.spid;
  edit.pid = release.vid;
  edit.spid = release.vid;
}

function cloneUniqueIds(orig: UniqueIds, clone: UniqueIds) {
  if (!orig.poid) {
    generateUniqueIds(orig);
  }
  clone.poid = orig.poid;
  clone.oid = createId();
  clone.pid = orig.vid;
  clone.vid = "";
  clone.spid = orig.vid;
}

//
// book
//
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
  releaseId: Book["id"],
  editId: Book["id"]
): Promise<void> {
  const edit = await findBookUniqueIds(editId);
  const release = await findBookUniqueIds(releaseId);
  if (!edit || !release) return;

  releaseUniqueIds(edit, release);

  await updateBookUniqueIds(editId, edit);
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

export function updateBookSpid(
  ids: UniqueIds,
) {
  return prisma.book.updateMany({
    where: { OR: [{ pid: ids.vid },{ spid: ids.vid }] },
    data: { spid: ids.spid ?? ids.pid }
  });
}

//
// topic
//
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
  releaseId: Topic["id"],
  editId: Topic["id"]
): Promise<void> {
  const edit = await findTopicUniqueIds(editId);
  const release = await findTopicUniqueIds(releaseId);
  if (!edit || !release) return;

  releaseUniqueIds(edit, release);

  await updateTopicUniqueIds(editId, edit);
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

export function updateTopicSpid(
  ids: UniqueIds,
) {
  return prisma.topic.updateMany({
    where: { OR: [{ pid: ids.vid },{ spid: ids.vid }] },
    data: { spid: ids.spid ?? ids.pid }
  });
}
