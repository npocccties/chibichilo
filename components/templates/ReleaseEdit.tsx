import Typography from "@mui/material/Typography";
import Container from "$atoms/Container";
import type { BookSchema } from "$server/models/book";
import ReleaseForm from "$organisms/ReleaseForm";
import type { ReleaseProps } from "$server/models/book/release";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SectionsTree from "$molecules/SectionsTree";
import Card from "@mui/material/Card";
import useCardStyles from "$styles/card";
import { useEffect, useState } from "react";

export type Props = {
  book: BookSchema;
  onSubmit(release: ReleaseProps): void;
};

function ReleaseEdit(props: Props) {
  const { book, onSubmit } = props;
  const cardClasses = useCardStyles();
  const [selectedNodeIds, select] = useState<Set<string>>(new Set());
  useEffect(() => {
    const nodeIds: string[] = [];
    book.sections.map((section) => {
      section.topics.map((topic, topicIndex) => {
        const nodeId = `${book.id}-${section.id}-${topic.id}:${topicIndex}`;
        nodeIds.push(nodeId);
      });
    });
    select(() => new Set(nodeIds));
  }, [book, select]);
  const handleTreeChange = (nodeId: string) => {
    select((nodeIds) =>
      nodeIds.delete(nodeId) ? new Set(nodeIds) : new Set(nodeIds.add(nodeId))
    );
  };
  const handleSubmit = (props: ReleaseProps) => {
    const topics: number[] = [];
    selectedNodeIds.forEach((nodeId) => {
      const [_bookId, _sectionId, topicId] = nodeId
        .replace(/:[^:]*$/, "")
        .split("-")
        .map((id) => Number(id));
      topics.push(topicId);
    });
    onSubmit({ ...props, topics });
  };
  return (
    <Container
      maxWidth="md"
      sx={{
        my: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h4">{book.name}</Typography>
      <ReleaseForm release={book.release ?? {}} onSubmit={handleSubmit} />
      <Card classes={cardClasses}>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <SectionsTree
            bookId={book.id}
            sections={book.sections}
            onTreeChange={handleTreeChange}
            selectedIndexes={selectedNodeIds}
          />
        </TreeView>
      </Card>
    </Container>
  );
}

export default ReleaseEdit;
