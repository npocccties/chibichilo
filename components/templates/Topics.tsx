import type { ChangeEvent } from "react";
import { useState } from "react";
import { useConfirm } from "material-ui-confirm";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ActionHeader from "$organisms/ActionHeader";
import ActionFooter from "$organisms/ActionFooter";
import ContentTypeIndicator from "$atoms/ContentTypeIndicator";
import ContentPreview from "$organisms/ContentPreview";
import FilterColumn from "$organisms/FilterColumn";
import TopicPreviewDialog from "$organisms/TopicPreviewDialog";
import SearchPagination from "$organisms/SearchPagination";
import Search from "$organisms/Search";
import Container from "$atoms/Container";
import SortSelect from "$atoms/SortSelect";
import type { ContentSchema } from "$server/models/content";
import type { TopicSchema } from "$server/models/topic";
import { grey } from "@mui/material/colors";
import useDialogProps from "$utils/useDialogProps";
import { useSearchAtom } from "$store/search";
import { useSessionAtom } from "$store/session";

type Props = {
  totalCount: number;
  contents: ContentSchema[];
  loading?: boolean;
  onBookNewClick(topics: TopicSchema[]): void;
  onTopicsShareClick(topics: TopicSchema[], shared: boolean): void;
  onTopicsDeleteClick(topics: TopicSchema[]): void;
  onContentEditClick(content: ContentSchema): void;
  onTopicNewClick(): void;
};

export default function Topics(props: Props) {
  const {
    totalCount,
    contents,
    loading = false,
    onBookNewClick,
    onTopicsShareClick,
    onTopicsDeleteClick,
    onContentEditClick,
    onTopicNewClick,
  } = props;
  const searchProps = useSearchAtom();
  const { isAdministrator, isContentEditable } = useSessionAtom();
  const confirm = useConfirm();
  const [selected, select] = useState<Map<ContentSchema["id"], ContentSchema>>(
    new Map()
  );
  const getSelectedTopics = () =>
    [...selected.values()].filter(
      (content) => content.type === "topic"
    ) as TopicSchema[];
  const handleChecked = (content: ContentSchema) => () =>
    select(
      (selected) =>
        new Map(
          selected.delete(content.id)
            ? selected
            : selected.set(content.id, content)
        )
    );
  const handleCheckAll = (event: ChangeEvent<HTMLInputElement>) => {
    select(
      () =>
        new Map(
          event.target.checked
            ? contents.map((content) => [content.id, content] as const)
            : []
        )
    );
  };
  const handleBookNewClick = () => {
    onBookNewClick(getSelectedTopics());
  };
  const handleTopicsShareClick = () => {
    onTopicsShareClick(getSelectedTopics(), true);
  };
  const handleTopicsUnshareClick = () => {
    onTopicsShareClick(getSelectedTopics(), false);
  };
  const handleTopicsDeleteClick = async () => {
    const topics = getSelectedTopics();
    if (topics.length === 0) return;
    await confirm({
      title: `${topics.length}件のトピックを削除します。よろしいですか？`,
      cancellationText: "キャンセル",
      confirmationText: "OK",
    });
    onTopicsDeleteClick(topics);
    select(() => new Map([]));
  };

  const {
    data: previewContent,
    dispatch: handlePreviewClick,
    ...dialogProps
  } = useDialogProps<ContentSchema>();

  const enableBookNewButton =
    isAdministrator || searchProps.query.filter === "edit";
  const enableShareButton =
    isAdministrator || searchProps.query.filter === "release";
  const enableDeleteButton =
    isAdministrator ||
    searchProps.query.filter === "edit" ||
    searchProps.query.filter === "release";

  return (
    <Container twoColumns maxWidth="xl">
      <Typography sx={{ mt: 5, gridArea: "title" }} variant="h4">
        トピック
        <Button size="small" color="primary" onClick={onTopicNewClick}>
          <AddIcon sx={{ mr: 0.5 }} />
          トピックの作成
        </Button>
      </Typography>
      <ActionHeader sx={{ gridArea: "action-header" }}>
        <ContentTypeIndicator type="topic" />
        <Badge
          sx={{
            display: "inline-flex",
            padding: 0,
            backgroundColor: "white",
            border: "1px solid",
            borderColor: grey[300],
            borderRadius: 2,
          }}
          badgeContent={selected.size}
          color="primary"
        >
          <Checkbox
            size="small"
            color="primary"
            checked={selected.size === contents.length && selected.size > 0}
            indeterminate={
              selected.size !== contents.length && selected.size > 0
            }
            onChange={handleCheckAll}
          />
        </Badge>
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
        {contents.map((content) => (
          <ContentPreview
            key={content.id}
            content={content}
            checked={selected.has(content.id)}
            onChange={handleChecked(content)}
            onContentPreviewClick={handlePreviewClick}
            onContentEditClick={
              isContentEditable(content) ? onContentEditClick : undefined
            }
            onKeywordClick={searchProps.onKeywordClick}
            onRelatedBookClick={searchProps.onRelatedBookClick}
          />
        ))}
        {loading &&
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} height={324 /* TODO: 妥当な値にしてほしい */} />
          ))}
      </Box>
      <SearchPagination
        sx={{ mt: 4, gridArea: "search-pagination" }}
        totalCount={totalCount}
      />
      {selected.size > 0 && (
        <ActionFooter maxWidth="lg">
          {enableBookNewButton && (
            <Button
              color="primary"
              size="large"
              variant="contained"
              onClick={handleBookNewClick}
            >
              ブック作成
            </Button>
          )}
          {enableShareButton && (
            <>
              <Button
                color="primary"
                size="large"
                variant="contained"
                onClick={handleTopicsShareClick}
              >
                シェア
              </Button>
              <Button
                color="primary"
                size="large"
                variant="contained"
                onClick={handleTopicsUnshareClick}
              >
                シェア解除
              </Button>
            </>
          )}
          {enableDeleteButton && (
            <Button
              color="error"
              size="large"
              variant="contained"
              onClick={handleTopicsDeleteClick}
            >
              削除
            </Button>
          )}
        </ActionFooter>
      )}
      {previewContent?.type === "topic" && (
        <TopicPreviewDialog {...dialogProps} topic={previewContent} />
      )}
    </Container>
  );
}
