import { ReactNode, MouseEvent, Fragment } from "react";
import IconButton from "@material-ui/core/IconButton";
import TreeItem from "@material-ui/lab/TreeItem";
import { EditOutlined } from "@material-ui/icons";
import useTreeItemStyle from "$styles/treeItem";
import { SectionSchema } from "$server/models/book/section";

type SectionProps = {
  bookId: string | number;
  section: Pick<SectionSchema, "id" | "name">;
  sectionIndex: number;
  children: ReactNode;
};

function SectionTree({
  bookId,
  section,
  sectionIndex,
  children,
}: SectionProps) {
  const treeItemClasses = useTreeItemStyle();
  if (section.name == null) return <Fragment>{children}</Fragment>;
  return (
    <Fragment>
      <TreeItem
        nodeId={`${bookId}-${section.id}`}
        classes={treeItemClasses}
        label={`${sectionIndex + 1} ${section.name}`}
      >
        {children}
      </TreeItem>
    </Fragment>
  );
}

type Props = {
  bookId?: string | number;
  sections: SectionSchema[];
  onItemClick(index: ItemIndex): void;
  onItemEditClick?(index: ItemIndex): void;
};

export default function BookChildrenTree(props: Props) {
  const { bookId = 0, sections, onItemClick, onItemEditClick } = props;
  const treeItemClasses = useTreeItemStyle();
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <SectionTree
          key={section.id}
          bookId={bookId}
          section={section}
          sectionIndex={sectionIndex}
        >
          {section.topics.map((topic, topicIndex) => {
            const handle = (handler: (index: ItemIndex) => void) => (
              event: MouseEvent<HTMLElement>
            ) => {
              event.stopPropagation();
              handler([sectionIndex, topicIndex]);
            };
            return (
              <TreeItem
                key={topic.id}
                nodeId={`${bookId}-${section.id}-${topic.id}`}
                classes={treeItemClasses}
                label={
                  <>
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
