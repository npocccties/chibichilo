import Dialog from "@mui/material/Dialog";
import TopicViewerContent from "$organisms/TopicViewerContent";
import type { TopicSchema } from "$server/models/topic";
import useCardStyles from "$styles/card";

export type TopicPreviewDialogProps = {
  topic: TopicSchema;
  open: boolean;
  onClose: React.MouseEventHandler;
};

export default function TopicPreviewDialog(props: TopicPreviewDialogProps) {
  const cardClasses = useCardStyles();
  const { topic, open, onClose } = props;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ classes: cardClasses }}
      fullWidth
    >
      <TopicViewerContent topic={topic} />
    </Dialog>
  );
}
