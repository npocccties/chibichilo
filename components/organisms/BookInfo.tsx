import Card from "@mui/material/Card";
import Markdown from "$atoms/Markdown";
import type { BookSchema } from "$server/models/book";
import KeywordChip from "$atoms/KeywordChip";
import useCardStyle from "$styles/card";
import { Box } from "@mui/material";
import type { ReleaseItemSchema } from "$server/models/releaseResult";
import DescriptionList from "$atoms/DescriptionList";
import getLocaleDateString from "$utils/getLocaleDateString";

type Props = {
  className?: string;
  id?: string;
  book: BookSchema;
  parent?: ReleaseItemSchema;
};

export default function BookInfo({ className, id, book, parent }: Props) {
  const cardClasses = useCardStyle();

  return (
    <Card className={className} classes={cardClasses} id={id}>
      {book.keywords && (
        <Box sx={{ mb: 1 }}>
          {book.keywords.map((keyword) => {
            return (
              <KeywordChip
                key={keyword.id}
                keyword={keyword}
                sx={{ mr: 0.5, maxWidth: "260px" }}
              />
            );
          })}
        </Box>
      )}
      {book.description && <Markdown>{book.description}</Markdown>}
      {parent?.release && (
        <>
          {"直前のリリース: "}
          <Box
            style={{
              display: "flex",
              alignItems: "left",
              flexWrap: "wrap",
              lineHeight: 2.5,
            }}
          >
            <DescriptionList
              nowrap
              sx={{ mx: 2 }}
              value={[
                {
                  key: "タイトル",
                  value: parent.name || "",
                },
              ]}
            />
            <DescriptionList
              nowrap
              sx={{ mx: 2 }}
              value={[
                {
                  key: "バージョン",
                  value: parent.release?.version || "",
                },
              ]}
            />
            {parent.release.releasedAt && (
              <DescriptionList
                nowrap
                sx={{ mx: 2 }}
                value={[
                  {
                    key: "リリース日",
                    value: getLocaleDateString(parent.release.releasedAt, "ja"),
                  },
                ]}
              />
            )}
          </Box>
        </>
      )}
    </Card>
  );
}
