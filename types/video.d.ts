type VideoLocation = {
  type: "youtube" | "vimeo" | "wowza";
  src: string;
};

type VideoSchema = VideoLocation & {
  id: number;
  title: string;
  description: string;
  creator: User["id"];
  skills: Skill[];
  tasks: Task[];
  levels: Level[];
  subtitles: Subtitle[];
};

type Video = WithState<VideoSchema>;

type VideosSchema = {
  videos: Array<Pick<VideoSchema, "id" | "title" | "description" | "creator">>;
};

type Videos = WithState<VideosSchema>;

type Subtitle = {
  id?: number;
  /** WebVTT file */
  file: File;
  /** ISO 639-1 code */
  lang: string;
};

type Skill = {
  id: number;
  name: string;
  has: boolean;
};
type Task = {
  id: number;
  name: string;
  has: boolean;
};
type Level = {
  id: number;
  name: string;
  has: boolean;
};
