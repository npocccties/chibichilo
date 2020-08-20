export default { title: "EditContents" };
import { EditContents } from "./EditContents";
import { Videos } from "./video";

const videos: Videos = {
  videos: [2, 4, 6, 8].map((id) => ({
    id,
    title: `Sample Video ${id}`,
    description: `Sample Description ${id}`,
    creator: `user${id}`,
  })),
  state: "success",
};

export const Basic = () => {
  return (
    <EditContents
      contents={{
        id: 42,
        title: "Contents title",
        videos: [2, 5, 7, 9].map((id) => ({
          id,
          title: `Sample video ${id}`,
          creator: `user${id}`,
        })),
        state: "success",
      }}
      videos={videos}
    />
  );
};

export const Empty = () => (
  <EditContents
    contents={{
      id: 42,
      title: "",
      videos: [],
      state: "success",
    }}
    videos={videos}
  />
);

export const ManyVideos = () => {
  return (
    <EditContents
      contents={{
        id: 42,
        title: "Contents title",
        videos: [2, 5, 7, 9, 12, 3, 13, 11, 1, 42, 3, 9].map((id) => ({
          id,
          title: `Sample video ${id}`,
          creator: `user${id}`,
        })),
        state: "success",
      }}
      videos={videos}
    />
  );
};

export const WithLongTitle = () => {
  return (
    <EditContents
      contents={{
        id: 42,
        title: "Contents title ".repeat(10),
        videos: [2, 5, 7, 9].map((id) => ({
          id,
          title: `Sample video ${id} `.repeat(30),
          creator: `user${id}`,
        })),
        state: "success",
      }}
      videos={videos}
    />
  );
};
