import { useCallback, type ReactNode } from "react";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import Card from "$atoms/Card";
import DescriptionList from "$atoms/DescriptionList";
import StripedMarkdown from "$atoms/StripedMarkdown";
import SectionsTreeView from "$organisms/SectionsTreeView";
import { authors } from "$utils/descriptionList";
import getLocaleDateString from "$utils/getLocaleDateString";

export type ReleasedBookCardProps = {
  book: BookSchema;
  onTopicPreview(topic: TopicSchema): void;
  onReleaseEditButtonClick?: () => void;
};

function ReleasedBookCard({
  book,
  onTopicPreview,
  onReleaseEditButtonClick,
}: ReleasedBookCardProps) {
  const onItemPreviewClick = useCallback(
    ([sectionIndex, topicIndex]: [
      sectionIndex: number,
      topicIndex: number
    ]) => {
      const topic = book.sections[sectionIndex]?.topics[topicIndex];
      onTopicPreview(topic);
    },
    [onTopicPreview, book.sections]
  );

  return (
    <Card>
      <section>
        <Typography variant="h5" gutterBottom>
          {book.release?.version}
          {onReleaseEditButtonClick && (
            <>
              {` `}
              <Button
                size="small"
                color="primary"
                onClick={onReleaseEditButtonClick}
              >
                <PeopleOutlinedIcon />
                リリースの編集
              </Button>
            </>
          )}
        </Typography>
        <DescriptionList
          sx={{ mb: 1 }}
          value={
            [
              book.release?.releasedAt instanceof Date && {
                key: "リリース日",
                value: getLocaleDateString(book.release.releasedAt),
              },
            ].filter(Boolean) as Array<{ key: string; value: ReactNode }>
          }
        />
        <Typography>{book.release?.comment}</Typography>
      </section>
      <section>
        <Typography variant="h5" gutterBottom>
          トピック
        </Typography>
        <SectionsTreeView
          bookId={book.id}
          sections={book.sections}
          onItemPreviewClick={onItemPreviewClick}
        />
      </section>
      <section>
        <Typography variant="h5" gutterBottom>
          基本情報
        </Typography>
        <section>
          <InputLabel htmlFor="shared">ブックのシェア</InputLabel>
          {/* TODO: https://github.com/npocccties/chibichilo/issues/909 */}
          <Checkbox
            id="shared"
            name="shared"
            color="primary"
            defaultChecked={book.shared}
            disabled
          />
        </section>
        <DescriptionList
          value={
            [
              {
                key: "作成日",
                value: getLocaleDateString(book.createdAt),
              },
              {
                key: "更新日",
                value: getLocaleDateString(book.updatedAt),
              },
              ...authors(book),
              book.keywords.length > 0 && {
                key: "キーワード",
                value: book.keywords.map((k) => k.name).join(", "),
              },
              {
                key: "解説",
                value: <StripedMarkdown content={book.description} />,
              },
            ].filter(Boolean) as Array<{ key: string; value: ReactNode }>
          }
        />
      </section>
    </Card>
  );
}

export default ReleasedBookCard;
