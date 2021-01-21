import IconButton from "@material-ui/core/IconButton";
import TreeItem from "@material-ui/lab/TreeItem";
import { InfoOutlined, EditOutlined } from "@material-ui/icons";
import CourseChip from "$atoms/CourseChip";
import BookChildrenTree from "$molecules/BookChildrenTree";
import useTreeItemStyle from "$styles/treeItem";
import { BookSchema } from "$server/models/book";

type Props = {
  book: BookSchema;
  onItemClick(index: ItemIndex): void;
  onItemEditClick?(index: ItemIndex): void;
  onBookInfoClick?(): void;
  onBookEditClick?(): void;
};

export default function BookTree(props: Props) {
  const {
    book,
    onItemClick,
    onItemEditClick,
    onBookInfoClick,
    onBookEditClick,
  } = props;
  const treeItemClasses = useTreeItemStyle();
  const handle = (handler?: () => void) => (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    handler && handler();
  };
  return (
    <TreeItem
      nodeId={`${book.id}`}
      classes={treeItemClasses}
      label={
        <>
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
      />
    </TreeItem>
  );
}
