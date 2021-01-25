import { ReactNode, MouseEvent, Fragment } from "react";
import IconButton from "@material-ui/core/IconButton";
import TreeItem from "@material-ui/lab/TreeItem";
import Checkbox from "@material-ui/core/Checkbox";
import { EditOutlined } from "@material-ui/icons";
import useTreeItemStyle from "$styles/treeItem";
import { SectionSchema } from "$server/models/book/section";

type SectionProps = Pick<Parameters<typeof Checkbox>[0], "checked"> & {
  bookId: string | number;
  section: Pick<SectionSchema, "id" | "name">;
  sectionIndex: number;
  children: ReactNode;
  onTreeChange?(nodeId: string): void;
};

function SectionTree({
  bookId,
  section,
  sectionIndex,
  children,
  onTreeChange,
  checked,
}: SectionProps) {
  const treeItemClasses = useTreeItemStyle();
  const nodeId = `${bookId}-${section.id}`;
  const handleChange = (handler?: (nodeId: string) => void) => () => {
    handler?.(nodeId);
  };
  if (section.name == null) return children;
  return (
    <TreeItem
      nodeId={nodeId}
      classes={treeItemClasses}
      label={
        <>
          {onTreeChange && (
            <Checkbox
              checked={checked}
              color="primary"
              size="small"
              onChange={handleChange(onTreeChange)}
              onClick={(event) => {
                event.stopPropagation();
              }}
            />
          )}
          {sectionIndex + 1} {section.name}
        </>
      }
    >
      {children}
    </TreeItem>
  );
}

type Props = Pick<Parameters<typeof Checkbox>[0], "checked"> & {
  bookId?: string | number;
  sections: SectionSchema[];
  onItemClick(index: ItemIndex): void;
  onItemEditClick?(index: ItemIndex): void;
  onTreeChange?(nodeId: string): void;
};

export default function BookChildrenTree(props: Props) {
  const {
    bookId = 0,
    sections,
    onItemClick,
    onItemEditClick,
    onTreeChange,
    checked,
  } = props;
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
            const nodeId = `${bookId}-${section.id}-${topic.id}`;
            const handle = (handler: (index: ItemIndex) => void) => (
              event: MouseEvent<HTMLElement>
            ) => {
              event.stopPropagation();
              handler([sectionIndex, topicIndex]);
            };
            const handleChange = (handler?: (nodeId: string) => void) => () => {
              handler?.(nodeId);
            };
            return (
              <TreeItem
                key={topic.id}
                nodeId={nodeId}
                classes={treeItemClasses}
                label={
                  <>
                    {onTreeChange && (
                      <Checkbox
                        checked={checked}
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
                    {onItemEditClick && (
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
