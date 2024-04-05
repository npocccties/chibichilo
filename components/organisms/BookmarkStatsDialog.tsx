import { useState } from "react";
import { Box, Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import WordCloud from "react-d3-cloud";
import type { BookSchema } from "$server/models/book";
import useCardStyles from "$styles/card";
import { useBook } from "$utils/book";
import { useBookmarksByTopicId } from "$utils/bookmark/useBookmarks";
import BookmarkStats from "./BookmarkStats";
import { useWordCloud } from "../../utils/useWordCloud";

function ListItem(topic: { id: number; name: string }) {
  const data = useBookmarksByTopicId({ topicId: topic.id, isAllUsers: true });
  if (data.isLoading) return null;

  return (
    <BookmarkStats.ListItem
      name={topic.name}
      bookmarks={data.bookmarks}
      bookmarkTagMenu={data.bookmarkTagMenu}
    />
  );
}

type Props = {
  book: Pick<BookSchema, "id" | "name"> & Partial<BookSchema>;
};

export default function BookmarkStatsDialog(props: Props) {
  const [open, setOpen] = useState(false);
  const cardClasses = useCardStyles();
  const { book } = useBook(props.book.id);
  const sections = props.book.sections ?? book?.sections ?? [];
  const data = useWordCloud({ bookId: props.book.id });

  return (
    <Box
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: "2",
        WebkitBoxOrient: "vertical",
      }}
    >
      <Button variant="text" onClick={() => setOpen(true)}>
        {props.book.name}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ classes: cardClasses }}
        fullWidth
      >
        {data.isLoading ? (
          <div
            style={{
              width: "80%",
              height: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <p>Loading...</p>
          </div>
        ) : (
          <Box sx={{ margin: "0 32px" }}>
            <h2>{props.book.name}</h2>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gridGap: "32px",
                width: "100%",
              }}
            >
              <BookmarkStats book={props.book}>
                <BookmarkStats.List>
                  {sections
                    .flatMap((s) => s.topics)
                    .map((t, i) => (
                      <ListItem key={i} {...t} />
                    ))}
                </BookmarkStats.List>
              </BookmarkStats>
              <WordCloud
                data={data.wordCloud}
                font="meiryo"
                fontSize={(word) => Math.pow(word.value, 0.8) * 10}
                rotate={(word) => (word.value % 2 === 1 ? 0 : 90)}
                random={Math.random}
                // TODO: add color
                // fill={(d, i) => schemeCategory10ScaleOrdinal(i)}
              />
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
