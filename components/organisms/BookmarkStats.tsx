import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { BookmarkSchema, BookmarkTagMenu } from "$server/models/bookmark";
import type { BookSchema } from "$server/models/book";
import Emoji from "$atoms/Emoji";

const listSx = {
  listStyle: "none",
};

const titleSx = {
  fontSize: "20px",
  margin: "0 0 8px 0",
};

const ulSx = {
  padding: 0,
  display: "flex",
  justifyContent: "center",
};

const tagListSx = {
  listStyle: "none",
  marginBottom: "8px",
  marginLeft: "8px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const tagSx = {
  listStyle: "none",
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  marginRight: "4px",
  borderRadius: "999px",
  border: "solid 1px #D1D5DB",
  backgroundColor: "#FFF",
  height: "24px",
  padding: "8px 6px",
  "> :first-child": {
    marginRight: "4px",
  },
};

const textSx = {
  fontSize: "12px",
};

function List(props: { children: ReactNode }) {
  return (
    <Box component="ul" sx={{ padding: 0, margin: 0 }}>
      {props.children}
    </Box>
  );
}

function ListItem(props: {
  bookId: number;
  name: string;
  bookmarks: Array<BookmarkSchema>;
  bookmarkTagMenu: BookmarkTagMenu;
}) {
  return (
    <Box component="li" sx={listSx}>
      <Box component="h3" sx={titleSx}>
        {props.name}
      </Box>
      <Box component="ul" sx={ulSx}>
        {props.bookmarkTagMenu.map((t) => {
          const count = props.bookmarks.filter(
            (b) => b.tagId === t.id && b.bookId === props.bookId
          ).length;

          return (
            <Box key={t.id} component="li" sx={tagListSx}>
              <Box component="div" sx={tagSx}>
                <Emoji emoji={t.emoji} />
                <Box component="p" sx={textSx}>
                  {count}
                </Box>
              </Box>
              <Box component="p" sx={textSx}>
                {t.label}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function BookmarkStats(props: {
  book: Pick<BookSchema, "id" | "name">;
  children: ReactNode;
}) {
  return <Box>{props.children}</Box>;
}

export default Object.assign(BookmarkStats, {
  List,
  ListItem,
});
