import type { FormEvent } from "react";
import { useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ActionHeader from "$organisms/ActionHeader";
import ActionFooter from "$organisms/ActionFooter";
import FilterColumn from "$organisms/FilterColumn";
import ContentPreview from "$organisms/ContentPreview";
import TopicPreviewDialog from "$organisms/TopicPreviewDialog";
import SearchPagination from "$organisms/SearchPagination";
import Search from "$organisms/Search";
import Container from "$atoms/Container";
import SortSelect from "$atoms/SortSelect";
import type { ContentSchema } from "$server/models/content";
import type { TopicSchema } from "$server/models/topic";
import useDialogProps from "$utils/useDialogProps";
import { useSearchAtom } from "$store/search";
import { useSessionAtom } from "$store/session";

type Props = {
  totalCount: number;
  contents: ContentSchema[];
  loading?: boolean;
  onLoadMore?(): void;
  onSubmit(topics: TopicSchema[]): void;
  onCancel(): void;
  onContentEditClick(content: ContentSchema): void;
};

export default function TopicImport(props: Props) {
  const {
    totalCount,
    contents,
    loading = false,
    onSubmit,
    onCancel,
    onContentEditClick,
  } = props;
  const searchProps = useSearchAtom();
  const { isContentEditable } = useSessionAtom();
  const [selectedIndexes, select] = useState<Set<number>>(new Set());
  const handleChecked = (index: number) => () =>
    select((indexes) =>
      indexes.delete(index) ? new Set(indexes) : new Set(indexes.add(index))
    );
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(
      [...selectedIndexes].flatMap((i) => {
        const content = contents[i];
        return content.type === "topic" ? [content] : [];
      })
    );
  };
  const {
    data: previewContent,
    dispatch: handlePreviewClick,
    ...dialogProps
  } = useDialogProps<ContentSchema>();
  return (
    <Container twoColumns maxWidth="xl">
      <Typography sx={{ mt: 5, gridArea: "title" }} variant="h4">
        トピックの再利用
      </Typography>
      <Typography sx={{ mt: 1, gridArea: "description" }} variant="body1">
        再利用するトピックを選んで下さい
      </Typography>
      <ActionHeader sx={{ gridArea: "action-header" }}>
        <SortSelect onSortChange={searchProps.onSortChange} />
        <Search
          label="トピック検索"
          value={searchProps.input}
          target={searchProps.target}
          onSearchInput={searchProps.onSearchInput}
          onSearchInputReset={searchProps.onSearchInputReset}
          onSearchSubmit={searchProps.onSearchSubmit}
          onSearchTargetChange={searchProps.onSearchTargetChange}
        />
      </ActionHeader>
      <FilterColumn sx={{ gridArea: "side" }} variant="topic" />
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, 296px)"
        gap={2}
        gridArea="items"
      >
        {contents.map((content, index) => (
          <ContentPreview
            key={index}
            content={content}
            checked={selectedIndexes.has(index)}
            onChange={handleChecked(index)}
            onContentPreviewClick={handlePreviewClick}
            onContentEditClick={
              isContentEditable(content) ? onContentEditClick : undefined
            }
            onKeywordClick={searchProps.onKeywordClick}
          />
        ))}
        {loading &&
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} height={324 /* TODO: 妥当な値にしてほしい */} />
          ))}
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
      {previewContent?.type === "topic" && (
        <TopicPreviewDialog {...dialogProps} topic={previewContent} />
      )}
    </Container>
  );
}
