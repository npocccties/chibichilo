import type { TopicSchema } from "$server/models/topic";
import type { BookSchema } from "$server/models/book";
import Card from "@mui/material/Card";
import type { SxProps, Theme } from "@mui/material/styles";
import TopicViewerContent from "$organisms/TopicViewerContent";
import card from "$styles/card";
import type { ActivitySchema } from "$server/models/activity";

const rootSx: SxProps<Theme> = {
  ...card,
  minWidth: 0,
  maxWidth: "100%",
  overflow: "visible",
};

type Props = {
  className?: string;
  topic: TopicSchema;
  book: BookSchema;
  bookActivity?: ActivitySchema[];
  onEnded?: () => void;
  offset?: string;
  isPrivateBook?: boolean;
  isBookPage?: boolean;
};

export default function TopicViewer({
  className,
  topic,
  book,
  bookActivity,
  onEnded,
  offset,
  isPrivateBook = false,
  isBookPage = false,
}: Props) {
  return (
    <Card sx={rootSx} className={className}>
      <TopicViewerContent
        topic={topic}
        book={book}
        bookActivity={bookActivity}
        onEnded={onEnded}
        offset={offset}
        isPrivateBook={isPrivateBook}
        isBookPage={isBookPage}
      />
    </Card>
  );
}
