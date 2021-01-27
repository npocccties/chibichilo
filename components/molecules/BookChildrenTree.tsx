import { ReactNode, MouseEvent } from "react";
import IconButton from "@material-ui/core/IconButton";
import TreeItem from "@material-ui/lab/TreeItem";
import Checkbox from "@material-ui/core/Checkbox";
import { EditOutlined } from "@material-ui/icons";
import useTreeItemStyle from "$styles/treeItem";
import { SectionSchema } from "$server/models/book/section";
import { TopicSchema } from "$server/models/topic";

type SectionProps = {
  bookIndex: number;
  section: Pick<SectionSchema, "id" | "name">;
  sectionIndex: number;
  children: ReactNode;
  onTreeChange?(index: TreeItemIndex): void;
  selectedIndexes?: Set<TreeItemIndex>;
};

function SectionTree({
  bookIndex,
  section,
  sectionIndex,
  // TODO: セクション単位でのインポートの実装
  // onTreeChange,
  // selectedIndexes,
  children,
}: SectionProps) {
  const treeItemClasses = useTreeItemStyle();
  const index = [bookIndex, sectionIndex, null];
  /* TODO: セクション単位でのインポートの実装
  const handleChange = (handler?: (index: TreeItemIndex) => void) => () => {
    handler?.(index);
  };
  */
  if (section.name == null) return <>{children}</>;
  return (
    <TreeItem
      nodeId={index.toString()}
      classes={treeItemClasses}
      label={
        <>
          {/* TODO: セクション単位でのインポートの実装
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
          {sectionIndex + 1} {section.name}
        </>
      }
    >
      {children}
    </TreeItem>
  );
}

type Props = {
  bookIndex?: number;
  sections: SectionSchema[];
  onItemClick(index: ItemIndex): void;
  onItemEditClick?(index: ItemIndex): void;
  onTreeChange?(index: TreeItemIndex): void;
  selectedIndexes?: Set<TreeItemIndex>;
  isTopicEditable?(topic: TopicSchema): boolean;
};

export default function BookChildrenTree(props: Props) {
  const {
    bookIndex = 0,
    sections,
    onItemClick,
    onItemEditClick,
    onTreeChange,
    selectedIndexes,
    isTopicEditable,
  } = props;
  const treeItemClasses = useTreeItemStyle();
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <SectionTree
          key={section.id}
          bookIndex={bookIndex}
          section={section}
          sectionIndex={sectionIndex}
          onTreeChange={onTreeChange}
        >
          {section.topics.map((topic, topicIndex) => {
            const index = [bookIndex, sectionIndex, topicIndex];
            const handle = (handler: (index: ItemIndex) => void) => (
              event: MouseEvent<HTMLElement>
            ) => {
              event.stopPropagation();
              handler([sectionIndex, topicIndex]);
            };
            const handleChange = (
              handler?: (index: TreeItemIndex) => void
            ) => () => {
              handler?.(index);
            };
            return (
              <TreeItem
                key={topic.id}
                nodeId={index.toString()}
                classes={treeItemClasses}
                label={
                  <>
                    {onTreeChange && (
                      <Checkbox
                        checked={selectedIndexes?.has(index)}
                        color="primary"
                        size="small"
                        onChange={handleChange(onTreeChange)}
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      />
                    )}
                    {sectionIndex + 1}
                    {section.name && `.${topicIndex + 1}`} {topic.name}
                    {isTopicEditable?.(topic) && onItemEditClick && (
                      <IconButton
                        size="small"
                        onClick={handle(onItemEditClick)}
                      >
                        <EditOutlined />
                      </IconButton>
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
