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
  bookId?: number;
  onItemClick(index: ItemIndex): void;
  onItemEditClick?(index: ItemIndex): void;
  onTreeChange?(nodeId: string): void;
  onBookInfoClick?(): void;
  onBookEditClick?: (() => void) | false;
  selectedIndexes?: Set<TreeItemIndex>;
  isTopicEditable?(topic: TopicSchema): boolean | undefined;
};

export default function BookTree(props: Props) {
  const {
    book,
    bookId = 0,
    onItemClick,
    onItemEditClick,
    onTreeChange,
    onBookInfoClick,
    onBookEditClick,
    selectedIndexes,
    isTopicEditable,
  } = props;
  const treeItemClasses = useTreeItemStyle();
  const nodeId = `${bookId}`;
  const handle = (handler?: () => void) => (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    handler?.();
  };
  /* TODO: ブック単位でのインポートの実装
  const handleChange = (handler?: (nodeId: string) => void) => () => {
    handler?.(nodeId);
  };
  */
  return (
    <TreeItem
      nodeId={nodeId}
      classes={treeItemClasses}
      label={
        <>
          {/* TODO: ブック単位でのインポートの実装
          onTreeChange && (
          <Checkbox
            checked={selectedIndexes?.has(nodeId)}
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
        bookId={book.id}
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
