import type { ReactNode } from "react";
import { css } from "@emotion/css";
import { Box } from "@mui/material";
import type { BookmarkSchema, BookmarkTagMenu } from "$server/models/bookmark";
import type { BookSchema } from "$server/models/book";
import Emoji from "$atoms/Emoji";

const listClass = css({
  listStyle: "none",
});

const titleClass = css({
  fontSize: "20px",
  margin: "0 0 8px 0",
});

const ulClass = css({
  padding: 0,
  display: "flex",
  justifyContent: "center",
});

const tagListClass = css({
  listStyle: "none",
  marginBottom: "8px",
  marginLeft: "8px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
});

const tagClass = css({
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
});

const text = css({
  fontSize: "12px",
});

function List(props: { children: ReactNode }) {
  return <ul>{props.children}</ul>;
}

function ListItem(props: {
  name: string;
  bookmarks: Array<BookmarkSchema>;
  bookmarkTagMenu: BookmarkTagMenu;
}) {
  return (
    <li className={listClass}>
      <h3 className={titleClass}>{props.name}</h3>
      <ul className={ulClass}>
        {props.bookmarkTagMenu.map((t) => {
          const count = props.bookmarks.filter((b) => b.tagId === t.id).length;

          return (
            <li key={t.id} className={tagListClass}>
              <div className={tagClass}>
                <Emoji emoji={t.emoji} />
                <p className={text}>{count}</p>
              </div>
              <p className={text}>{t.label}</p>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

function BookmarkStats(props: {
  book: Pick<BookSchema, "name">;
  children: ReactNode;
}) {
  return <Box>{props.children}</Box>;
}

export default Object.assign(BookmarkStats, {
  List,
  ListItem,
});
