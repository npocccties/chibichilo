import { MouseEvent, Fragment, useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Collapse from "@material-ui/core/Collapse";
import { ExpandLess, ExpandMore, EditOutlined } from "@material-ui/icons";
import { SectionSchema } from "$server/models/book/section";

type ItemIndex = [number, number];

type Props = {
  className?: string;
  sections: SectionSchema[];
  onItemClick(event: MouseEvent<HTMLElement>, index: ItemIndex): void;
  onItemEditClick?(event: MouseEvent<HTMLElement>, index: ItemIndex): void;
};

export default function BookChildren(props: Props) {
  const { className, sections, onItemClick, onItemEditClick } = props;
  const [open, setOpen] = useState<boolean[]>(sections.map(() => true));
  const handleItemClick = (event: MouseEvent<HTMLElement>) => {
    const { section, topic } = event.currentTarget.dataset;
    onItemClick(event, [section, topic].map(Number) as ItemIndex);
  };
  const handleSectionClick = (sectionItemIndex: number) => {
    setOpen((open) => {
      const newOpen = open.slice();
      newOpen[sectionItemIndex] = !newOpen[sectionItemIndex];
      return newOpen;
    });
  };
  const handleItemEditClick = (...index: ItemIndex) => (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    onItemEditClick?.(event, index);
  };
  return (
    <List disablePadding className={className}>
      {sections.map((section, sectionItemIndex) => (
        <Fragment key={section.id}>
          {(section.name && (
            <>
              <ListItem
                button
                onClick={() => handleSectionClick(sectionItemIndex)}
              >
                <ListItemText>
                  {sectionItemIndex + 1} {section.name}
                </ListItemText>
                {open[sectionItemIndex] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={open[sectionItemIndex]}>
                {section.topics.map((topic, topicItemIndex) => (
                  <ListItem
                    key={topic.id}
                    button
                    data-section={sectionItemIndex}
                    data-topic={topicItemIndex}
                    onClick={handleItemClick}
                  >
                    <ListItemText>
                      {sectionItemIndex + 1}
                      {section.name && `.${topicItemIndex + 1}`} {topic.name}
                    </ListItemText>
                    {onItemEditClick && (
                      <ListItemSecondaryAction>
                        <IconButton
                          color="primary"
                          onClick={handleItemEditClick(
                            sectionItemIndex,
                            topicItemIndex
                          )}
                        >
                          <EditOutlined />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </Collapse>
            </>
          )) || (
            <>
              {section.topics.map((topic, topicItemIndex) => (
                <ListItem
                  key={topic.id}
                  button
                  data-section={sectionItemIndex}
                  data-topic={topicItemIndex}
                  onClick={handleItemClick}
                >
                  <ListItemText>
                    {sectionItemIndex + 1}
                    {section.name && `.${topicItemIndex + 1}`} {topic.name}
                  </ListItemText>
                  {onItemEditClick && (
                    <ListItemSecondaryAction>
                      <IconButton
                        color="primary"
                        onClick={handleItemEditClick(
                          sectionItemIndex,
                          topicItemIndex
                        )}
                      >
                        <EditOutlined />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </>
          )}
        </Fragment>
      ))}
    </List>
  );
}
