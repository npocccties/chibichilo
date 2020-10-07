import {
  fetchJson,
  postFormFetchJson,
  postFormFetchText,
  postJsonFetchText,
  useApi,
} from "./api";
import { mutate } from "swr";

const key = "/api/contents";
const basePath = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "";

const initialContentsIndex: ContentsIndex = {
  contents: [],
  state: "pending",
};
function fetchContentsIndex(_: typeof key) {
  const url = `${basePath}/call/content_list_view.php`;
  return fetchJson(url).then(indexHandler);
}
function indexHandler(res: ContentsIndexResponse): ContentsIndexSchema {
  return {
    contents: res.map(({ id, name, timemodified, createdby }) => ({
      id: Number(id),
      title: name,
      creator: createdby,
      updateAt: new Date(timemodified),
    })),
  };
}
type ContentsIndexResponse = Array<{
  id: string;
  name: string;
  timemodified: string;
  createdby: string;
}>;
export const useContentsIndex = () =>
  useApi(key, fetchContentsIndex, initialContentsIndex);

const initialContents: Contents = {
  id: NaN,
  title: "",
  videos: [],
  state: "pending",
};
async function fetchContents(_: typeof key, id: ContentsSchema["id"]) {
  if (!Number.isFinite(id)) return initialContents;
  const url = `${basePath}/call/list_content_view.php`;
  const req: ShowContentsRequest = { content_id: id.toString() };
  const res = await postFormFetchJson(url, req).then(showHandler(id));
  return res;
}
const showHandler = (contentsId: ContentsSchema["id"]) => (
  res: ShowContentsResponse
): ContentsSchema => ({
  id: contentsId,
  title: res.title,
  videos: res.contents.map(({ id, cname, createdby }) => ({
    id: Number(id),
    title: cname,
    creator: createdby,
  })),
});
type ShowContentsRequest = { content_id: string };
type ShowContentsResponse = {
  title: string;
  contents: Array<{
    id: string;
    cname: string;
    createdby: string;
  }>;
};
export const useContents = (id: ContentsSchema["id"]) =>
  useApi([key, id], fetchContents, initialContents);

export async function showContents(id: ContentsSchema["id"]) {
  if (!Number.isFinite(id)) return failure(id);
  return mutate([key, id]);
}

export async function create(contents: ContentsSchema) {
  const url = `${basePath}/call/content_create.php`;
  const req: CreateContentsRequest = {
    title: contents.title,
    contents: contents.videos.map(({ id, title }) => [id, title]),
  };
  try {
    const id = Number(await postJsonFetchText(url, req));
    await success({ ...contents, id });
    return id;
  } catch {
    await failure(contents.id);
    return NaN;
  }
}

async function update(contents: ContentsSchema) {
  const url = `${basePath}/call/content_update.php`;
  const req: UpdateContentsRequest = {
    id: contents.id,
    title: contents.title,
    contents: contents.videos.map(({ id, title }) => [id, title]),
  };
  try {
    await postJsonFetchText(url, req);
    return await success(contents);
  } catch {
    return await failure(contents.id);
  }
}

export async function destroyContents(id: ContentsSchema["id"]) {
  if (!Number.isFinite(id)) return await failure(id);
  const url = `${basePath}/call/content_delete.php`;
  const req: DestroyContentsRequest = {
    content_id: id.toString(),
  };
  try {
    await postFormFetchText(url, req);
    await success({ ...initialContents, id });
  } catch {
    await failure(id);
  }
}

export async function saveContents(contents: ContentsSchema) {
  let id: ContentsSchema["id"] = contents.id;
  if (Number.isFinite(id)) {
    await update(contents);
  } else {
    id = await create(contents);
  }
  return id;
}

async function success(contents: ContentsSchema) {
  await mutate([key, contents.id], (prev?: Contents) => ({
    ...(prev || initialContents),
    ...contents,
    state: "success",
  }));
  await mutate(key);
}

async function failure(id: ContentsSchema["id"]) {
  await mutate([key, id], (prev?: Contents) => ({
    ...(prev || initialContents),
    state: "failure",
  }));
  await mutate(key);
}

type CreateContentsRequest = {
  title: string;
  contents: Array<[number, string]>;
};
type UpdateContentsRequest = { id: number } & CreateContentsRequest;
type DestroyContentsRequest = ShowContentsRequest;
