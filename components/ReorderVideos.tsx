import React from "react";
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import EditIcon from "@material-ui/icons/Edit";
import TitleIcon from "@material-ui/icons/Title";
import CloseIcon from "@material-ui/icons/Close";
import { Menu, MenuItems } from "./Menu";
import {
  usePopupState,
  bindTrigger,
  PopupState,
} from "material-ui-popup-state/hooks";
import { useRouter } from "./router";

export function ReorderVideos(props: {
  videos: Array<{ id: number; title: string }>;
  onVideoDragEnd: (source: number, destination: number) => void;
  onEditVideoTitle: (index: number, title: string) => void;
  onDeleteVideo: (index: number) => void;
}) {
  function onDragEnd({ source, destination }: DropResult) {
    if (!destination) return;
    if (source === destination) return;
    props.onVideoDragEnd(source.index, destination.index);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="ReorderVideos">
        {(provided) => (
          <List ref={provided.innerRef} {...provided.droppableProps}>
            {props.videos.map((video, index) => (
              <DraggableVideo
                index={index}
                draggableId={`${index}#${video.id}`}
                key={`${index}#${video.id}`}
                video={video}
                onEditVideoTitle={props.onEditVideoTitle}
                onDeleteVideo={props.onDeleteVideo}
              />
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function DraggableVideo(props: {
  index: number;
  draggableId: string;
  video: { id: number; title: string };
  onEditVideoTitle: (index: number, title: string) => void;
  onDeleteVideo: (index: number) => void;
}) {
  const popupState = usePopupState({
    variant: "popover",
    popupId: "DraggableVideoMenu",
  });
  const router = useRouter();
  const previewHandler = React.useCallback(() => {
    router.push({
      pathname: "/contents",
      query: {
        id: router.query.id,
        action: router.query.action,
        preview: props.video.id,
      },
    });
  }, [props.video, router]);
  const editVideoTitleHandler = React.useCallback(
    (
      event: React.KeyboardEvent<HTMLElement> | React.FocusEvent<HTMLElement>
    ) => {
      const title = (event.target as HTMLInputElement).value;
      // NOTE: 文字列中に含まれる " " 以外のホワイトスペースを許容しない
      const validTitle = title.replace(/\s/g, " ").trim();
      if (validTitle) props.onEditVideoTitle(props.index, title);
    },
    [props.onEditVideoTitle, props.index]
  );
  const [editableTitle, setEditableTitle] = React.useState(false);
  // NOTE: focus() 目的
  const inputTitleRef = React.useRef(document.createElement("input"));

  return (
    <Draggable draggableId={props.draggableId} index={props.index}>
      {(provided) => (
        <ListItem ref={provided.innerRef} {...provided.draggableProps} selected>
          <ListItemIcon {...provided.dragHandleProps}>
            <DragHandleIcon />
          </ListItemIcon>
          <TextField
            inputRef={inputTitleRef}
            label="タイトル"
            fullWidth
            color="secondary"
            defaultValue={props.video.title}
            onKeyDown={(e) => {
              // NOTE: submit 抑制目的
              if (e.which === "\r".charCodeAt(0)) e.preventDefault();
            }}
            onKeyUp={(e) => {
              editVideoTitleHandler(e);
              if (e.which === "\r".charCodeAt(0)) setEditableTitle(false);
            }}
            onBlur={(e) => {
              editVideoTitleHandler(e);
              setEditableTitle(false);
            }}
            // NOTE: DraggableChildrenFn のなかで mount し直しても反映されないので style 使う
            style={{ display: editableTitle ? "unset" : "none" }}
          />
          <ListItemText
            primary={props.video.title}
            secondary={`#${props.video.id}`}
            onClick={previewHandler}
            style={{
              // NOTE: DraggableChildrenFn のなかで mount し直しても反映されないので style 使う
              display: editableTitle ? "none" : "unset",
              cursor: "pointer",
            }}
            primaryTypographyProps={{
              style: {
                whiteSpace: "nowrap",
                overflow: "hidden",
              },
            }}
          />
          <ListItemIcon>
            <IconButton
              edge="end"
              aria-label="more"
              {...bindTrigger(popupState)}
            >
              <MoreVertIcon />
            </IconButton>
          </ListItemIcon>
          <VideoMoreMenu
            popupState={popupState}
            video={props.video}
            onTitleEdit={() => {
              setEditableTitle(true);
              // NOTE: focus() だと反応しないので setTimeout() 使う
              setTimeout(() => inputTitleRef.current.focus());
            }}
            onDelete={() => {
              props.onDeleteVideo(props.index);
            }}
          />
        </ListItem>
      )}
    </Draggable>
  );
}

function VideoMoreMenu(props: {
  popupState: PopupState;
  video: { id: number };
  onDelete: () => void;
  onTitleEdit: () => void;
}) {
  const router = useRouter();
  const menuItems: MenuItems = [
    {
      label: "ビデオを編集する",
      icon: <EditIcon />,
      onClick() {
        router.push({
          pathname: "/contents",
          query: {
            id: router.query.id,
            action: router.query.action,
            video: props.video.id,
          },
        });
      },
    },
    {
      label: "タイトルを変更する",
      icon: <TitleIcon />,
      onClick() {
        props.onTitleEdit();
      },
    },
    {
      label: "取り除く",
      icon: <CloseIcon />,
      onClick() {
        props.onDelete();
      },
    },
  ];
  return <Menu popupState={props.popupState} items={menuItems} />;
}
