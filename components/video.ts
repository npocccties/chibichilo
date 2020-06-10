import {
  jsonFetcher,
  WithState,
  useApi,
  makeFetcher,
  postForm,
  textFetcher,
  postJson,
} from "./api";
import { Skill } from "./video/skill";
import { Task } from "./video/task";
import { Level } from "./video/level";
import { Subtitle, createSubtitle } from "./video/subtitle";
import { mutate } from "swr";

const key = "/api/video";

type YouTubeVideoId = string;
export type VideoSchema = {
  id?: number;
  title: string;
  description: string;
  youtubeVideoId: YouTubeVideoId;
  skills: Skill[];
  tasks: Task[];
  levels: Level[];
  subtitles: Subtitle[];
};

type UserId = string; // NOTE: セッションに含まれる利用者のID
type VideosSchema = {
  videos: Array<{
    id: number;
    title: string;
    description: string;
    creator: UserId;
  }>;
};

export type Video = WithState<VideoSchema>;
export type Videos = WithState<VideosSchema>;

const initialVideos: Videos = {
  videos: [],
  state: "pending",
};
const fetchVideos = makeFetcher(
  (_: typeof key) =>
    jsonFetcher(
      `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_search.php`
    ).then(videosHandler),
  initialVideos
);
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
  title: "",
  description: "",
  youtubeVideoId: "",
  skills: [],
  tasks: [],
  levels: [],
  subtitles: [],
  state: "pending",
};
const fetchVideo = makeFetcher(async (_: typeof key, id?: number) => {
  if (id == null || !Number.isFinite(id))
    return (await fetchInitialVideo()) || initialVideo;
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_edit.php`;
  const req: ShowVideoRequest = {
    microcontent_id: id.toString(),
  };
  const video: VideoSchema = await jsonFetcher(url, postForm(req)).then(
    showVideoHandler(id)
  );
  return {
    id,
    ...video,
  };
}, initialVideo);
const fetchInitialVideo = makeFetcher(async (_: typeof key) => {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_new.php`;
  const video: VideoSchema = await jsonFetcher(url).then(initialVideoHandler);
  return video;
}, initialVideo);
function showVideoHandler(
  videoId: Video["id"]
): (res: ShowVideoResponse) => VideoSchema {
  return (res) => ({
    title: res.title,
    description: res.description,
    youtubeVideoId: res.video,
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
  video: YouTubeVideoId;
  description: string;
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
export const useVideo = (id?: number) =>
  useApi([key, id], fetchVideo, initialVideo);

export async function createVideo(
  video: VideoSchema
): Promise<number | undefined> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_create.php`;
  const req: CreateVideoRequest = {
    title: video.title,
    video: video.youtubeVideoId,
    description: video.description,
    subtitles: video.subtitles,
    skill: video.skills.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
    task: video.tasks.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
    level: video.levels.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
  };
  let id: VideoSchema["id"];
  try {
    id = Number(await textFetcher(url, postJson(req)));
  } catch {}
  if (!id) {
    await failure(video.id);
    return;
  }

  if (video.subtitles.length === 0) {
    await success({ ...video, id });
    return id;
  }

  // NOTE: With subtitle files
  try {
    await Promise.all(video.subtitles.map(createSubtitle(id)));
    await success({ ...video, id });
    return id;
  } catch {
    await failure(video.id);
    return;
  }
}
type CreateVideoRequest = {
  title: string;
  video: YouTubeVideoId;
  description: string;
  subtitles: Subtitle[];
  skill: string[];
  task: string[];
  level: string[];
};

export async function updateVideo(video: Required<VideoSchema>) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/microcontent_update.php`;
  const req: UpdateVideoRequest = {
    id: video.id,
    title: video.title,
    video: video.youtubeVideoId,
    description: video.description,
    subtitles: video.subtitles,
    skill: video.skills.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
    task: video.tasks.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
    level: video.levels.flatMap(({ id, has }) => (has ? [id.toString()] : [])),
  };
  let id: VideoSchema["id"];
  try {
    id = Number(await textFetcher(url, postJson(req)));
  } catch {}
  if (!id) {
    return await failure(video.id);
  }

  if (video.subtitles.length === 0) {
    return await success({ ...video, id });
  }

  // NOTE: With subtitle files
  try {
    await Promise.all(video.subtitles.map(createSubtitle(id)));
    return await success({ ...video, id });
  } catch {
    return await failure(video.id);
  }
}
type UpdateVideoRequest = {
  id: number;
} & CreateVideoRequest;

export async function destroyVideo(id: VideoSchema["id"]) {
  if (id == null) {
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

async function success(video: Required<VideoSchema>) {
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
