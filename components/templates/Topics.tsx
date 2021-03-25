import useInfiniteScroll from "react-infinite-scroll-hook";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import AddIcon from "@material-ui/icons/Add";
import ActionHeader from "$organisms/ActionHeader";
import TopicPreview from "$organisms/TopicPreview";
import TopicPreviewDialog from "$organisms/TopicPreviewDialog";
import SortSelect from "$atoms/SortSelect";
import CreatorFilter from "$atoms/CreatorFilter";
import SearchTextField from "$atoms/SearchTextField";
import { TopicSchema } from "$server/models/topic";
import { SortOrder } from "$server/models/sortOrder";
import { Filter } from "$types/filter";
import useContainerStyles from "$styles/container";
import useDialogProps from "$utils/useDialogProps";
import { useSearchAtom } from "$store/search";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(0.5),
  },
  topics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 296px)",
    gap: `${theme.spacing(2)}px`,
  },
}));

type Props = {
  topics: TopicSchema[];
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?(): void;
  onTopicEditClick(topic: TopicSchema): void;
  onTopicNewClick(): void;
  onSortChange?(sort: SortOrder): void;
  onFilterChange?(filter: Filter): void;
};

export default function Topics(props: Props) {
  const {
    topics,
    loading = false,
    hasNextPage = false,
    onLoadMore = () => undefined,
    onTopicEditClick,
    onTopicNewClick,
    onSortChange,
    onFilterChange,
  } = props;
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  const {
    data: previewTopic,
    dispatch: setPreviewTopic,
    ...dialogProps
  } = useDialogProps<TopicSchema>();
  const { onSearchInput } = useSearchAtom();
  const handleTopicDetailClick = (topic: TopicSchema) => setPreviewTopic(topic);
  const infiniteRef = useInfiniteScroll<HTMLDivElement>({
    loading,
    hasNextPage,
    onLoadMore,
  });
  return (
    <Container ref={infiniteRef} classes={containerClasses} maxWidth="lg">
      <ActionHeader
        title={
          <>
            トピック
            <Button size="small" color="primary" onClick={onTopicNewClick}>
              <AddIcon className={classes.icon} />
              トピックの作成
            </Button>
          </>
        }
        action={
          <>
            <SortSelect onSortChange={onSortChange} />
            <CreatorFilter onFilterChange={onFilterChange} />
            <SearchTextField
              placeholder="トピック検索"
              onSearchInput={onSearchInput}
            />
          </>
        }
      />
      <div className={classes.topics}>
        {topics.map((topic, index) => (
          <TopicPreview
            key={index}
            topic={topic}
            onTopicDetailClick={handleTopicDetailClick}
            onTopicEditClick={onTopicEditClick}
          />
        ))}
        {loading &&
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} height={324 /* NOTE: 適当 */} />
          ))}
      </div>
      {previewTopic && (
        <TopicPreviewDialog {...dialogProps} topic={previewTopic} />
      )}
    </Container>
  );
}
