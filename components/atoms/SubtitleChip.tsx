import Chip from "@mui/material/Chip";
import CloseIcon from "@mui/icons-material/Close";
import type { VideoTrackSchema } from "$server/models/videoTrack";
import languages from "$utils/languages";
import { gray } from "$theme/colors";

type Props = {
  videoTrack: VideoTrackSchema;
  onDelete(videoTrack: VideoTrackSchema): void;
};

export default function SubtitleChip(props: Props) {
  const { videoTrack, onDelete } = props;
  const handleDelete = () => {
    onDelete(videoTrack);
  };
  return (
    <Chip
      sx={{ backgroundColor: gray[100], borderRadius: "4px" }}
      size="small"
      label={languages[videoTrack.language]}
      onDelete={handleDelete}
      deleteIcon={<CloseIcon />}
    />
  );
}
