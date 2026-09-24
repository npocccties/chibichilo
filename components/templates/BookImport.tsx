import type { FormEvent } from "react";
import { useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TopicPreviewDialog from "$organisms/TopicPreviewDialog";
import ActionHeader from "$organisms/ActionHeader";
import ActionFooter from "$organisms/ActionFooter";
import FilterColumn from "$organisms/FilterColumn";
import BookTree from "$organisms/BookTree";
import SearchPagination from "$organisms/SearchPagination";
import Search from "$organisms/Search";
import Container from "$atoms/Container";
import SortSelect from "$atoms/SortSelect";
import type { ContentSchema } from "$server/models/content";
import type { BookSchema } from "$server/models/book";
import type { SectionSchema } from "$server/models/book/section";
import type { TopicSchema } from "$server/models/topic";
import type { IsContentEditable } from "$server/models/content";
import { useSearchAtom } from "$store/search";
import useDialogProps from "$utils/useDialogProps";

type Props = {
  totalCount: number;
  contents: ContentSchema[];
  loading?: boolean;
  onSubmit({
    books,
    sections,
    topics,
  }: {
    books: BookSchema[];
    sections: SectionSchema[];
    topics: TopicSchema[];
  }): void;
  onCancel(): void;
  onBookPreviewClick?(book: BookSchema): void;
  onBookEditClick?(book: BookSchema): void;
  onTopicEditClick?(topic: TopicSchema): void;
  isContentEditable?: IsContentEditable;
};

export default function BookImport(props: Props) {
  const {
    totalCount,
    contents,
    loading = false,
    onSubmit,
    onCancel,
    onBookPreviewClick,
    onBookEditClick,
    onTopicEditClick,
    isContentEditable,
  } = props;
  const searchProps = useSearchAtom();
  const [selectedNodeIds, select] = useState<Set<string>>(new Set());
  const handleTreeChange = (nodeId: string) => {
    select((nodeIds) =>
      nodeIds.delete(nodeId) ? new Set(nodeIds) : new Set(nodeIds.add(nodeId))
    );
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const selectedBooks: BookSchema[] = [];
    const selectedSections: SectionSchema[] = [];
    const selectedTopics: TopicSchema[] = [];
    selectedNodeIds.forEach((nodeId) => {
      // TODO: BookTree と SectionsTree にある nodeId の構造に合わせて変更
      const [bookId, sectionId, topicId] = nodeId
        .replace(/:[^:]*$/, "")
        .split("-")
        .map((id) => Number(id));
      const book = contents.find(
        (content) => content.type === "book" && content.id === bookId
      );
      if (book?.type !== "book") return;
      const section = book.sections.find((section) => section.id === sectionId);
      if (!section) {
        selectedBooks.push(book);
        return;
      }
      const topic = section.topics.find((topic) => topic.id === topicId);
      if (!topic) {
        selectedSections.push(section);
        return;
      }
      selectedTopics.push(topic);
    });

    onSubmit({
      books: selectedBooks,
      sections: selectedSections,
      topics: selectedTopics,
    });
  };
  const {
    data: previewTopic,
    dispatch: setPreviewTopic,
    ...topicPreviewDialogProps
  } = useDialogProps<TopicSchema>();
  const handleTopicPreviewClick = (topic: TopicSchema) =>
    setPreviewTopic(topic);
  return (
    <Container twoColumns maxWidth="lg">
      <Typography sx={{ mt: 5, gridArea: "title" }} variant="h4">
        ブックの再利用
      </Typography>
      <Typography sx={{ mt: 1, gridArea: "description" }} variant="body1">
        再利用するトピックを選んで下さい
      </Typography>
      <ActionHeader sx={{ gridArea: "action-header" }}>
        <SortSelect onSortChange={searchProps.onSortChange} />
        <Search
          label="ブック・トピック検索"
          value={searchProps.input}
          target={searchProps.target}
          onSearchInput={searchProps.onSearchInput}
          onSearchInputReset={searchProps.onSearchInputReset}
          onSearchSubmit={searchProps.onSearchSubmit}
          onSearchTargetChange={searchProps.onSearchTargetChange}
        />
      </ActionHeader>
      <FilterColumn sx={{ gridArea: "side" }} variant="book" />
      <Box gridArea="items">
        <SimpleTreeView
          slots={{
            collapseIcon: ExpandMoreIcon,
            expandIcon: ChevronRightIcon,
          }}
        >
          {contents.map((content) => {
            if (content.type !== "book") return null;
            const handleItem =
              (handler?: (topic: TopicSchema) => void) =>
              ([sectionIndex, topicIndex]: ItemIndex) =>
                handler?.(content.sections[sectionIndex].topics[topicIndex]);
            return (
              <BookTree
                key={content.id}
                book={content}
                onItemPreviewClick={handleItem(handleTopicPreviewClick)}
                onItemEditClick={handleItem(onTopicEditClick)}
                onBookPreviewClick={onBookPreviewClick}
                onBookEditClick={
                  isContentEditable?.(content) ? onBookEditClick : undefined
                }
                onLtiContextClick={searchProps.onLtiContextClick}
                isContentEditable={isContentEditable}
                onTreeChange={handleTreeChange}
              />
            );
          })}
        </SimpleTreeView>
        {loading &&
          [...Array(5)].map((_, i) => <Skeleton key={i} height={40} />)}
      </Box>
      <ActionFooter maxWidth="lg">
        <Button color="primary" size="small" variant="text" onClick={onCancel}>
          キャンセル
        </Button>
        <form onSubmit={handleSubmit}>
          <Button
            color="primary"
            size="large"
            variant="contained"
            type="submit"
          >
            再利用
          </Button>
        </form>
      </ActionFooter>
      <SearchPagination
        sx={{ mt: 4, gridArea: "search-pagination" }}
        totalCount={totalCount}
      />
      {previewTopic && (
        <TopicPreviewDialog {...topicPreviewDialogProps} topic={previewTopic} />
      )}
    </Container>
  );
}
