export default { title: "AddVideosButton" };
import { AddVideosButton } from "./AddVideosButton";
import { useState } from "react";
import { VideosRow } from "./VideosSelectorTable";
import Typography from "@material-ui/core/Typography";

const videos: Videos = {
  videos: [2, 4, 6, 8].map((id) => ({
    id,
    title: `Sample Video ${id}`,
    description: `Sample Description ${id}`,
    creator: `user${id}`,
  })),
  state: "success",
};

export function Basic() {
  const [selected, select] = useState<VideosRow[]>([]);
  return (
    <div>
      <Typography variant="subtitle1">
        Selected: {JSON.stringify(selected)}
      </Typography>
      <br />
      <AddVideosButton videos={videos} onOpen={() => {}} onClose={select} />
    </div>
  );
}
