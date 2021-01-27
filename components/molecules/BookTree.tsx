import IconButton from "@material-ui/core/IconButton";
import TreeItem from "@material-ui/lab/TreeItem";
// TODO: ブック単位でのインポートの実装
// import Checkbox from "@material-ui/core/Checkbox";
import { InfoOutlined, EditOutlined } from "@material-ui/icons";
import CourseChip from "$atoms/CourseChip";
import BookChildrenTree from "$molecules/BookChildrenTree";
import useTreeItemStyle from "$styles/treeItem";
import { BookSchema } from "$server/models/book";
import { TopicSchema } from "$server/models/topic";

type Props = {
  book: BookSchema;
  bookIndex: number;
  onItemClick(index: ItemIndex): void;
  onItemEditClick?(index: ItemIndex): void;
  onTreeChange?(index: TreeItemIndex): void;
  onBookInfoClick?(): void;
  onBookEditClick?: (() => void) | false;
  selectedIndexes?: Set<TreeItemIndex>;
  isTopicEditable?(topic: TopicSchema): boolean;
};

export default function BookTree(props: Props) {
  const {
    book,
    bookIndex,
    onItemClick,
    onItemEditClick,
    onTreeChange,
    onBookInfoClick,
    onBookEditClick,
    selectedIndexes,
    isTopicEditable,
  } = props;
  const treeItemClasses = useTreeItemStyle();
  const index: TreeItemIndex = [bookIndex, null, null];
  const handle = (handler?: () => void) => (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    handler?.();
  };
  /* TODO: ブック単位でのインポートの実装
  const handleChange = (handler?: (index: TreeItemIndex) => void) => () => {
    handler?.(index);
  };
  */
  return (
    <TreeItem
      nodeId={index.toString()}
      classes={treeItemClasses}
      label={
        <>
          {/* TODO: ブック単位でのインポートの実装
          onTreeChange && (
          <Checkbox
            checked={selectedIndexes?.has(index)}
            color="primary"
            size="small"
            onChange={handleChange(onTreeChange)}
            onClick={(event) => {
              event.stopPropagation();
            }}
          />
          )*/}
          {book.name}
          <IconButton size="small" onClick={handle(onBookInfoClick)}>
            <InfoOutlined />
          </IconButton>
          {onBookEditClick && (
            <IconButton size="small" onClick={handle(onBookEditClick)}>
              <EditOutlined />
            </IconButton>
          )}
          {book.ltiResourceLinks.map((ltiResourceLink) => (
            <CourseChip
              key={ltiResourceLink.contextId}
              ltiResourceLink={ltiResourceLink}
            />
          ))}
        </>
      }
    >
      <BookChildrenTree
        bookIndex={book.id}
        sections={book.sections}
        onItemClick={onItemClick}
        onItemEditClick={onItemEditClick}
        onTreeChange={onTreeChange}
        selectedIndexes={selectedIndexes}
        isTopicEditable={isTopicEditable}
      />
    </TreeItem>
  );
}
