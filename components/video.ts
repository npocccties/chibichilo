import {
  jsonFetcher,
  useApi,
  makeFetcher,
  postForm,
  textFetcher,
  postJson,
} from "./api";
import { createSubtitles } from "./video/subtitle";
import { mutate } from "swr";

const key = "/api/video";

const initialVideos: Videos = {
  videos: [],
  state: "pending",
};
const fetchVideos = makeFetcher((_: typeof key) => {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_search.php`;
  return jsonFetcher(url).then(videosHandler);
}, initialVideos);
type VideosResponse = {
  contents: Array<{
    id: string;
    name: string;
    description: string;
    createdby: string;
  }>;
};
function videosHandler(res: VideosResponse): VideosSchema {
  return {
    videos: res.contents.map(({ id, name, description, createdby }) => ({
      id: Number(id),
      title: name,
      description,
      creator: createdby,
    })),
  };
}
export const useVideos = () => useApi(key, fetchVideos, initialVideos);

const initialVideo: Video = {
  id: NaN,
  title: "",
  description: "",
  type: "wowza",
  src: "",
  creator: "",
  skills: [],
  tasks: [],
  levels: [],
  subtitles: [],
  state: "pending",
};
const fetchVideo = makeFetcher(async (_: typeof key, id: VideoSchema["id"]) => {
  if (!Number.isFinite(id)) return (await fetchInitialVideo()) || initialVideo;
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_edit.php`;
  const req: ShowVideoRequest = {
    microcontent_id: id.toString(),
  };
  const res = await jsonFetcher(url, postForm(req)).then(showHandler(id));
  return res;
}, initialVideo);
const fetchInitialVideo = makeFetcher(async (_: typeof key) => {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_new.php`;
  const res = await jsonFetcher(url).then(initialVideoHandler);
  return res;
}, initialVideo);
function showHandler(
  videoId: Video["id"]
): (res: ShowVideoResponse) => VideoSchema {
  return (res) => ({
    id: videoId,
    title: res.title,
    description: res.description,
    type: res.type,
    src: res.src,
    creator: res.createdby,
    skills: res.skills.map(({ id, name, checked }) => ({
      id: Number(id),
      name,
      has: checked === "checked",
    })),
    tasks: res.tasks.map(({ id, name, checked }) => ({
      id: Number(id),
      name,
      has: checked === "checked",
    })),
    levels: res.levels.map(({ id, name, checked }) => ({
      id: Number(id),
      name,
      has: checked === "checked",
    })),
    subtitles: res.subtitles.map(({ id, cname }) => ({
      id: Number(id),
      lang: cname,
      file: new File([], `${videoId}_${cname}.vtt`),
    })),
  });
}
function initialVideoHandler(res: InitialVideoResponse): VideoSchema {
  return {
    ...initialVideo,
    skills: res.skills.map(({ id, name }) => ({
      id: Number(id),
      name,
      has: false,
    })),
    tasks: res.tasks.map(({ id, name }) => ({
      id: Number(id),
      name,
      has: false,
    })),
    levels: res.levels.map(({ id, name }) => ({
      id: Number(id),
      name,
      has: false,
    })),
  };
}
type ShowVideoRequest = {
  microcontent_id: string;
};
type ShowVideoResponse = {
  title: string;
  type: VideoSchema["type"];
  src: VideoSchema["src"];
  description: string;
  createdby: string;
  subtitles: Array<{ id: string; cname: string }>; // NOTE: `{id}_{cname}.vtt` cname as langcode
  skills: Array<{ id: string; name: string; checked: "" | "checked" }>;
  tasks: Array<{ id: string; name: string; checked: "" | "checked" }>;
  levels: Array<{ id: string; name: string; checked: "" | "checked" }>;
};
type InitialVideoResponse = {
  skills: Array<{ id: string; name: string }>;
  tasks: Array<{ id: string; name: string }>;
  levels: Array<{ id: string; name: string }>;
};
export const useVideo = (id: VideoSchema["id"]) =>
  useApi([key, id], fetchVideo, initialVideo);

export async function createVideo(
  video: VideoSchema
): Promise<VideoSchema["id"]> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_create.php`;
  const req: CreateVideoRequest = {
    title: video.title,
    type: video.type,
    src: video.src,
    description: video.description,
    subtitles: video.subtitles,
    skill: video.skills.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
    task: video.tasks.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
    level: video.levels.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
  };
  let id: VideoSchema["id"] = NaN;
  try {
    id = Number(await textFetcher(url, postJson(req)));
  } catch {}
  if (!Number.isFinite(id)) {
    await failure(video.id);
    return NaN;
  }

  try {
    await createSubtitles(id, video.subtitles);
    await success({ ...video, id });
    return id;
  } catch {
    await failure(video.id);
    return NaN;
  }
}
type CreateVideoRequest = {
  title: string;
  type: VideoSchema["type"];
  src: VideoSchema["src"];
  description: string;
  subtitles: Subtitle[];
  skill: string[];
  task: string[];
  level: string[];
};

export async function updateVideo(video: VideoSchema) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_update.php`;
  const req: UpdateVideoRequest = {
    id: video.id,
    title: video.title,
    type: video.type,
    src: video.src,
    description: video.description,
    subtitles: video.subtitles,
    skill: video.skills.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
    task: video.tasks.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
    level: video.levels.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
  };
  let id: VideoSchema["id"] = NaN;
  try {
    id = Number(await textFetcher(url, postJson(req)));
  } catch {}
  if (!Number.isFinite(id)) {
    return await failure(video.id);
  }

  try {
    await createSubtitles(id, video.subtitles);
    return await success({ ...video, id });
  } catch {
    return await failure(video.id);
  }
}
type UpdateVideoRequest = {
  id: number;
} & CreateVideoRequest;

export async function destroyVideo(id: VideoSchema["id"]) {
  if (!Number.isFinite(id)) {
    return await failure(id);
  }
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_delete.php`;
  const req: DestroyVideoRequest = {
    microcontentid: id.toString(),
  };
  try {
    await textFetcher(url, postForm(req));
    return await success({ ...initialVideo, id });
  } catch {
    return await failure(id);
  }
}
type DestroyVideoRequest = {
  microcontentid: string;
};

async function success(video: VideoSchema) {
  await mutate([key, video.id], (prev?: Video) => ({
    ...(prev || initialVideo),
    ...video,
    state: "success",
  }));
  await mutate(key);
  return true;
}

async function failure(id: VideoSchema["id"]) {
  await mutate([key, id], (prev?: Video) => ({
    ...(prev || initialVideo),
    state: "failure",
  }));
  await mutate(key);
  return true;
}
