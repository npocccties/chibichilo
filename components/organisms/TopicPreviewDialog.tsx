import Dialog from "@mui/material/Dialog";
import TopicViewerContent from "$organisms/TopicViewerContent";
import type { TopicSchema } from "$server/models/topic";
import useCardStyles from "$styles/card";

type Props = {
  topic: TopicSchema;
  open: boolean;
  onClose: React.MouseEventHandler;
  isPrivateBook?: boolean;
};

export default function TopicPreviewDialog({
  topic,
  open,
  onClose,
  isPrivateBook = false,
}: Props) {
  const cardClasses = useCardStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ classes: cardClasses }}
      fullWidth
    >
      <TopicViewerContent topic={topic} isPrivateBook={isPrivateBook} />
    </Dialog>
  );
}
