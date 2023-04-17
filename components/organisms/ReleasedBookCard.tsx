import { useCallback, type ReactNode } from "react";
import Typography from "@mui/material/Typography";
import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { ReleaseProps } from "$server/models/book/release";
import Card from "$atoms/Card";
import DescriptionList from "$atoms/DescriptionList";
import StripedMarkdown from "$atoms/StripedMarkdown";
import SectionsTreeView from "$organisms/SectionsTreeView";
import { authors } from "$utils/descriptionList";
import getLocaleDateString from "$utils/getLocaleDateString";

export type ReleasedBookCardProps = {
  book: BookSchema;
  release: ReleaseProps;
  onTopicPreview(topic: Pick<TopicSchema, "id">): void;
};

function ReleasedBookCard({
  book,
  release,
  onTopicPreview,
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
          {release.version}
        </Typography>
        <Typography>{release.comment}</Typography>
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
