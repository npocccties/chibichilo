import { FormEvent, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ActionHeader from "$organisms/ActionHeader";
import ActionFooter from "$organisms/ActionFooter";
import BookItemDialog from "$organisms/BookItemDialog";
import BookTree from "$molecules/BookTree";
import SortSelect from "$atoms/SortSelect";
import CreatorFilter from "$atoms/CreatorFilter";
import SearchTextField from "$atoms/SearchTextField";
import { BookSchema } from "$server/models/book";
import { SectionSchema } from "$server/models/book/section";
import { TopicSchema } from "$server/models/topic";
import { SortOrder } from "$server/models/sortOrder";
import useContainerStyles from "$styles/container";
import useDialogProps from "$utils/useDialogProps";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(0.5),
  },
  books: {
    "&> :not(:last-child)": {
      marginBottom: theme.spacing(2),
    },
  },
  form: {
    "& > *": {
      marginRight: theme.spacing(1),
    },
  },
}));

type Props = {
  books: BookSchema[];
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?(): void;
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
  onBookEditClick?(book: BookSchema): void;
  onTopicClick?(topic: TopicSchema): void;
  onTopicEditClick?(topic: TopicSchema): void;
  onSortChange?(sort: SortOrder): void;
  isBookEditable?(book: BookSchema): boolean | undefined;
  isTopicEditable?(topic: TopicSchema): boolean | undefined;
};

export default function BookImport(props: Props) {
  const {
    books,
    loading = false,
    hasNextPage = false,
    onLoadMore = () => undefined,
    onSubmit,
    onCancel,
    onBookEditClick,
    onTopicClick,
    onTopicEditClick,
    onSortChange,
    isBookEditable,
    isTopicEditable,
  } = props;
  const classes = useStyles();
  const containerClasses = useContainerStyles();
  const {
    data: currentBook,
    dispatch: setBook,
    ...dialogProps
  } = useDialogProps<BookSchema>();
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
      // TODO: BookTree と BookChildrenTree にある nodeId の構造に合わせて変更
      const [bookId, sectionId, topicId] = nodeId
        .replace(/:[^:]*$/, "")
        .split("-")
        .map((id) => Number(id));
      const book = books.find((book) => book.id === bookId);
      if (!book) return;
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
  const infiniteRef = useInfiniteScroll<HTMLDivElement>({
    loading,
    hasNextPage,
    onLoadMore,
  });
  return (
    <Container ref={infiniteRef} classes={containerClasses} maxWidth="md">
      <ActionHeader
        title={
          <>
            ブックの再利用
            <Typography variant="body1">
              再利用するトピックを選んで下さい
            </Typography>
          </>
        }
        action={
          <>
            <SortSelect onSortChange={onSortChange} />
            <CreatorFilter
              disabled /* TODO: フィルタリング機能を追加したら有効化して */
            />
            <SearchTextField
              placeholder="ブック・トピック検索"
              disabled // TODO: ブック・トピック検索機能追加したら有効化して
            />
          </>
        }
      />
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {books.map((book) => {
          const handleItem = (handler?: (topic: TopicSchema) => void) => ([
            sectionIndex,
            topicIndex,
          ]: ItemIndex) =>
            handler?.(book.sections[sectionIndex].topics[topicIndex]);
          const handleBookInfoClick = () => setBook(book);
          return (
            <BookTree
              key={book.id}
              book={book}
              onItemClick={handleItem(onTopicClick)}
              onItemEditClick={handleItem(onTopicEditClick)}
              onBookInfoClick={handleBookInfoClick}
              onBookEditClick={isBookEditable?.(book) && onBookEditClick}
              isTopicEditable={isTopicEditable}
              onTreeChange={handleTreeChange}
            />
          );
        })}
      </TreeView>
      {loading && [...Array(5)].map((_, i) => <Skeleton key={i} height={40} />)}
      <ActionFooter maxWidth="md">
        <form className={classes.form} onSubmit={handleSubmit}>
          <Button
            color="primary"
            size="small"
            variant="text"
            onClick={onCancel}
          >
            キャンセル
          </Button>
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
      {currentBook && <BookItemDialog {...dialogProps} book={currentBook} />}
    </Container>
  );
}
