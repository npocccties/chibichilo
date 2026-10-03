import type { ReactNode, MouseEvent } from "react";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import Checkbox from "@mui/material/Checkbox";
import PreviewButton from "$atoms/PreviewButton";
import EditButton from "$atoms/EditButton";
import treeItemLabel from "$styles/treeItem";
import type { SectionSchema } from "$server/models/book/section";
import type { IsContentEditable } from "$server/models/content";
import { isNamedSection, getOutlineNumber } from "$utils/outline";

const treeItemSx = { [`& .${treeItemClasses.label}`]: treeItemLabel };

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
  const nodeId = `${bookId}-${section.id}`;
  /* TODO: セクション単位での再利用の実装
  const handleChange = (handler?: (nodeId: string) => void) => () => {
    handler?.(nodeId);
  };
  */
  if (!isNamedSection(section)) return <>{children}</>;
  return (
    <TreeItem
      itemId={nodeId}
      sx={treeItemSx}
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
                itemId={nodeId}
                sx={treeItemSx}
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
