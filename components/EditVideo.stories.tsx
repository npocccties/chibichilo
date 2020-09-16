export default { title: "EditVideo" };
import { EditVideo } from "./EditVideo";

const video: Video = {
  id: 39,
  title: "Sample Video",
  description: "Sample Description",
  type: "youtube",
  src: "3yfen-t49eI",
  creator: "user",
  subtitles: [{ lang: "en", file: new File([], "sample_file.vtt") }],
  skills: [1, 2, 3].map((id) => ({ id, has: id === 3, name: `skill ${id}` })),
  tasks: [1, 2, 3].map((id) => ({ id, has: id === 2, name: `task ${id}` })),
  levels: [1, 2, 3].map((id) => ({ id, has: id === 1, name: `level ${id}` })),
  state: "success",
};

export const Basic = () => {
  return <EditVideo video={video} />;
};
