export default { title: "VideosSelectorTable" };
import { VideosSelectorTable } from "./VideosSelectorTable";

export const Basic = () => {
  return (
    <VideosSelectorTable
      rows={[2, 4, 6, 8].map((id) => ({
        id,
        title: `Sample video ${id}`,
        description: `Sample description ${id}`,
        creator: `user${id}`,
      }))}
      onSelect={(rows) => alert("DEBUG:\n" + JSON.stringify(rows))}
    />
  );
};
