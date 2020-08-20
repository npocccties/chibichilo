import {
  jsonFetcher,
  textFetcher,
  postJson,
  postForm,
  WithState,
  makeFetcher,
  useApi,
} from "./api";
import { mutate } from "swr";

const key = "/api/contents";

type VideoId = number; // NOTE: Video.id
type UserId = string; // NOTE: セッションに含まれる利用者のID
type ContentsSchema = {
  id?: number;
  title: string;
  videos: Array<{
    id: VideoId;
    title: string;
    creator: UserId;
  }>;
};
type ContentsIndexSchema = {
  contents: Array<{
    id: number;
    title: string;
    creator: UserId;
    updateAt: Date;
  }>;
};

export type Contents = WithState<ContentsSchema>;
export type ContentsIndex = WithState<ContentsIndexSchema>;

const initialContentsIndex: ContentsIndex = {
  contents: [],
  state: "pending",
};
const fetchContentsIndex = makeFetcher(
  (_: typeof key) =>
    jsonFetcher(
      `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/content_list_view.php`
    ).then(contentsIndexHandler),
  initialContentsIndex
);
function contentsIndexHandler(res: ContentsIndexResponse): ContentsIndexSchema {
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
  title: "",
  videos: [],
  state: "pending",
};
const fetchContents = makeFetcher(async (_: typeof key, id?: number) => {
  if (id == null) return initialContents;
  if (!Number.isFinite(id)) return initialContents;
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/list_content_view.php`;
  const req: ShowContentsRequest = {
    content_id: id.toString(),
  };
  const contents: ContentsSchema = await jsonFetcher(url, postForm(req)).then(
    showContentsHandler
  );
  return {
    id,
    ...contents,
  };
}, initialContents);
function showContentsHandler(res: ShowContentsResponse): ContentsSchema {
  return {
    title: res.title,
    videos: res.contents.map(({ id, cname, createdby }) => ({
      id: Number(id),
      title: cname,
      creator: createdby,
    })),
  };
}
type ShowContentsRequest = {
  content_id: string;
};
type ShowContentsResponse = {
  title: string;
  contents: Array<{
    id: string;
    cname: string;
    createdby: string;
  }>;
};
export const useContents = (id?: number) =>
  useApi([key, id], fetchContents, initialContents);

export async function showContents(id: ContentsSchema["id"]) {
  if (id == null) {
    return failure(id);
  }
  return mutate([key, id]);
}

export async function createContents(contents: ContentsSchema) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/content_create.php`;
  const req: CreateContentsRequest = {
    title: contents.title,
    contents: contents.videos.map(({ id, title }) => [id, title]),
  };
  try {
    const id = Number(await textFetcher(url, postJson(req)));
    await success({ ...contents, id });
    return id;
  } catch {
    failure(contents.id);
    return;
  }
}

export async function updateContents(contents: Required<ContentsSchema>) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/content_update.php`;
  const req: UpdateContentsRequest = {
    id: contents.id,
    title: contents.title,
    contents: contents.videos.map(({ id, title }) => [id, title]),
  };
  try {
    await textFetcher(url, postJson(req));
    return await success(contents);
  } catch {
    return await failure(contents.id);
  }
}

export async function destroyContents(id: ContentsSchema["id"]) {
  if (id == null) {
    return await failure(id);
  }
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/content_delete.php`;
  const req: DestroyContentsRequest = {
    content_id: id.toString(),
  };
  try {
    await textFetcher(url, postForm(req));
    return await success({ ...initialContents, id });
  } catch {
    return await failure(id);
  }
}

async function success(contents: Required<ContentsSchema>) {
  await mutate([key, contents.id], (prev?: Contents) => ({
    ...(prev || initialContents),
    ...contents,
    state: "success",
  }));
  await mutate(key);
  return true;
}

async function failure(id: ContentsSchema["id"]) {
  await mutate([key, id], (prev?: Contents) => ({
    ...(prev || initialContents),
    state: "failure",
  }));
  await mutate(key);
  return false;
}

type CreateContentsRequest = {
  title: string;
  contents: Array<[number, string]>;
};
type UpdateContentsRequest = { id: number } & CreateContentsRequest;
type DestroyContentsRequest = ShowContentsRequest;
