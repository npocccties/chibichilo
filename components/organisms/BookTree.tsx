import TreeItem from "@mui/lab/TreeItem";
import makeStyles from "@mui/styles/makeStyles";
import PreviewButton from "$atoms/PreviewButton";
import EditButton from "$atoms/EditButton";
import CourseChip from "$atoms/CourseChip";
import SharedIndicator from "$atoms/SharedIndicator";
import SectionsTree from "$molecules/SectionsTree";
import useTreeItemStyle from "$styles/treeItem";
import type { BookSchema } from "$server/models/book";
import type { IsContentEditable } from "$server/models/content";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";

const useStyles = makeStyles((theme) => ({
  shared: {
    margin: theme.spacing(0, 0.5),
  },
}));

type Props = {
  book: BookSchema;
  onItemClick?(index: ItemIndex): void;
  onItemPreviewClick?(index: ItemIndex): void;
  onItemEditClick?(index: ItemIndex): void;
  onTreeChange?(nodeId: string): void;
  onBookPreviewClick?(book: BookSchema): void;
  onBookEditClick?(book: BookSchema): void;
  onLtiContextClick?(
    ltiResourceLink: Pick<LtiResourceLinkSchema, "consumerId" | "contextId">
  ): void;
  selectedIndexes?: Set<string>;
  isContentEditable?: IsContentEditable;
};

export default function BookTree(props: Props) {
  const {
    book,
    onItemClick,
    onItemPreviewClick,
    onItemEditClick,
    onTreeChange,
    onBookPreviewClick,
    onBookEditClick,
    onLtiContextClick,
    selectedIndexes,
    isContentEditable,
  } = props;
  const classes = useStyles();
  const treeItemClasses = useTreeItemStyle();
  const nodeId = `${book.id}`;
  const handle =
    (handler?: (book: BookSchema) => void) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handler?.(book);
    };
  /* TODO: ブック単位での再利用の実装
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
          {/* TODO: ブック単位での再利用の実装
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
          {book.release?.shared && (
            <SharedIndicator className={classes.shared} />
          )}
          <PreviewButton variant="book" onClick={handle(onBookPreviewClick)} />
          {onBookEditClick && (
            <EditButton variant="book" onClick={handle(onBookEditClick)} />
          )}
          {book.ltiResourceLinks.map((ltiResourceLink, index) => (
            <CourseChip
              key={index}
              ltiResourceLink={ltiResourceLink}
              onLtiResourceLinkClick={onLtiContextClick}
            />
          ))}
        </>
      }
    >
      <SectionsTree
        bookId={book.id}
        sections={book.sections}
        onItemClick={onItemClick}
        onItemPreviewClick={onItemPreviewClick}
        onItemEditClick={onItemEditClick}
        onTreeChange={onTreeChange}
        selectedIndexes={selectedIndexes}
        isContentEditable={isContentEditable}
      />
    </TreeItem>
  );
}
