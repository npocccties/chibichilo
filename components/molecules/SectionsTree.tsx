import type { ReactNode, MouseEvent } from "react";
import TreeItem from "@mui/lab/TreeItem";
import Checkbox from "@mui/material/Checkbox";
import makeStyles from "@mui/styles/makeStyles";
import PreviewButton from "$atoms/PreviewButton";
import EditButton from "$atoms/EditButton";
import SharedIndicator from "$atoms/SharedIndicator";
import useTreeItemStyle from "$styles/treeItem";
import type { SectionSchema } from "$server/models/book/section";
import type { IsContentEditable } from "$server/models/content";
import { isNamedSection, getOutlineNumber } from "$utils/outline";

const useStyles = makeStyles((theme) => ({
  shared: {
    margin: theme.spacing(0, 0.5),
  },
}));

type SectionProps = {
  bookId: number;
  section: Pick<SectionSchema, "id" | "name" | "topics">;
  sectionIndex: number;
  children: ReactNode;
  onTreeChange?(nodeId: string): void;
  selectedIndexes?: Set<string>;
};

function SectionTree({
  bookId,
  section,
  sectionIndex,
  // TODO: セクション単位での再利用の実装
  // onTreeChange,
  // selectedIndexes,
  children,
}: SectionProps) {
  const treeItemClasses = useTreeItemStyle();
  const nodeId = `${bookId}-${section.id}`;
  /* TODO: セクション単位での再利用の実装
  const handleChange = (handler?: (nodeId: string) => void) => () => {
    handler?.(nodeId);
  };
  */
  if (!isNamedSection(section)) return <>{children}</>;
  return (
    <TreeItem
      nodeId={nodeId}
      classes={treeItemClasses}
      label={
        <>
          {/* TODO: セクション単位での再利用の実装
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
          {getOutlineNumber(section, sectionIndex) + " "}
          {section.name ?? "無名のセクション"}
        </>
      }
    >
      {children}
    </TreeItem>
  );
}

type Props = {
  bookId?: number;
  sections: SectionSchema[];
  onItemClick?(index: ItemIndex): void;
  onItemPreviewClick?(index: ItemIndex): void;
  onItemEditClick?(index: ItemIndex): void;
  onTreeChange?(nodeId: string): void;
  selectedIndexes?: Set<string>;
  isContentEditable?: IsContentEditable;
};

export default function SectionsTree(props: Props) {
  const {
    bookId = 0,
    sections,
    onItemClick,
    onItemPreviewClick,
    onItemEditClick,
    onTreeChange,
    selectedIndexes,
    isContentEditable,
  } = props;
  const classes = useStyles();
  const treeItemClasses = useTreeItemStyle();
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <SectionTree
          key={section.id}
          bookId={bookId}
          section={section}
          sectionIndex={sectionIndex}
          onTreeChange={onTreeChange}
        >
          {section.topics.map((topic, topicIndex) => {
            const nodeId = `${bookId}-${section.id}-${topic.id}:${topicIndex}`;
            const handle =
              (handler?: (index: ItemIndex) => void) =>
              (event: MouseEvent<HTMLElement>) => {
                event.stopPropagation();
                handler?.([sectionIndex, topicIndex]);
              };
            const handleChange = (handler?: (nodeId: string) => void) => () => {
              handler?.(nodeId);
            };
            return (
              <TreeItem
                key={nodeId}
                nodeId={nodeId}
                classes={treeItemClasses}
                label={
                  <>
                    {onTreeChange && (
                      <Checkbox
                        checked={selectedIndexes?.has(nodeId)}
                        color="primary"
                        size="small"
                        onChange={handleChange(onTreeChange)}
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      />
                    )}
                    {getOutlineNumber(section, sectionIndex, topicIndex) + " "}
                    {topic.name}
                    {topic.shared && (
                      <SharedIndicator className={classes.shared} />
                    )}
                    {onItemPreviewClick && (
                      <PreviewButton
                        variant="topic"
                        onClick={handle(onItemPreviewClick)}
                      />
                    )}
                    {isContentEditable?.(topic) && onItemEditClick && (
                      <EditButton
                        variant="topic"
                        onClick={handle(onItemEditClick)}
                      />
                    )}
                  </>
                }
                onClick={handle(onItemClick)}
              />
            );
          })}
        </SectionTree>
      ))}
    </>
  );
}
