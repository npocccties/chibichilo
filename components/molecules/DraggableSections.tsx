import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  closestCorners,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type Active,
  type CollisionDetection,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
  type Over,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useEffect, useRef, useState, type RefObject } from "react";
import useDebouncedCallback from "$utils/useDebouncedCallback";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import makeStyles from "@mui/styles/makeStyles";
import RemoveButton from "$atoms/RemoveButton";
import SectionTextField from "$atoms/SectionTextField";
import type { SectionSchema } from "$server/models/book/section";
import type { TopicSchema } from "$server/models/topic";
import { gray, primary } from "$theme/colors";
import reorder, { update, remove } from "$utils/reorder";

type SectionDragData = {
  type: "section";
  sectionId: number;
};

type TopicDragData = {
  type: "topic";
  sectionId: number;
  topicId: number;
};

type SectionTopicsDragData = {
  type: "section-topics";
  sectionId: number;
};

type SectionTopDragData = {
  type: "section-top";
  sectionId: number;
};

type DragData =
  | SectionDragData
  | TopicDragData
  | SectionTopicsDragData
  | SectionTopDragData;

function sectionSortableId(sectionId: number) {
  return `section-${sectionId}`;
}

function topicSortableId(sectionId: number, topicId: number) {
  return `topic-${sectionId}-${topicId}`;
}

function sectionDroppableId(sectionId: number) {
  return `droppable-${sectionId}`;
}

// 要素間へのドロップを取りこぼしにくくする衝突判定
const topicCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  const cornerCollisions = closestCorners(args);
  if (cornerCollisions.length > 0) {
    return cornerCollisions;
  }
  return closestCenter(args);
};

// 先頭へのドロップ判定を上側余白まで広げる
const TOP_INSERT_MARGIN = 32;

function getActiveMidY(active: Active): number | null {
  const translated = active.rect.current.translated;
  if (!translated) return null;
  return translated.top + translated.height / 2;
}

function getTopicInsertionIndex(
  over: Over,
  active: Active,
  baseIndex: number
): number {
  const overRect = over.rect;
  const activeMidY = getActiveMidY(active);
  if (!overRect || activeMidY === null) return baseIndex;

  const overMidY = overRect.top + overRect.height / 2;
  const isUpward = activeMidY < overMidY;
  const topExtension = baseIndex === 0 || isUpward ? TOP_INSERT_MARGIN : 0;
  const effectiveTop = overRect.top - topExtension;
  const effectiveHeight = overRect.height + topExtension;

  let insertAfterThreshold: number;
  if (baseIndex === 0) {
    insertAfterThreshold = 0.75;
  } else if (isUpward) {
    insertAfterThreshold = 0.65;
  } else {
    insertAfterThreshold = 0.4;
  }

  const thresholdY = effectiveTop + effectiveHeight * insertAfterThreshold;

  if (activeMidY > thresholdY) {
    return baseIndex + 1;
  }
  return baseIndex;
}

function getTopicInsertionIndexInSection(
  section: SectionSchema,
  over: Over,
  active: Active
): number {
  const overRect = over.rect;
  const activeMidY = getActiveMidY(active);
  if (!overRect || activeMidY === null) return section.topics.length;

  const effectiveTop = overRect.top - TOP_INSERT_MARGIN;
  const effectiveBottom = overRect.bottom;
  const effectiveHeight = effectiveBottom - effectiveTop;

  if (effectiveHeight <= 0) return section.topics.length;

  const relativeY = activeMidY - effectiveTop;
  const slotCount = section.topics.length + 1;
  const index = Math.min(
    section.topics.length,
    Math.max(0, Math.floor((relativeY / effectiveHeight) * slotCount))
  );
  return index;
}

const useSectionTopicsDroppableStyles = makeStyles(() => ({
  topics: {
    position: "relative",
  },
  topDropZone: {
    position: "absolute",
    top: -TOP_INSERT_MARGIN,
    left: 0,
    right: 0,
    height: TOP_INSERT_MARGIN,
  },
}));

function SectionTopDroppable({ section }: { section: SectionSchema }) {
  const classes = useSectionTopicsDroppableStyles();
  const { setNodeRef } = useDroppable({
    id: `section-top-${section.id}`,
    data: {
      type: "section-top",
      sectionId: section.id,
    } satisfies SectionTopDragData,
  });
  return <div ref={setNodeRef} className={classes.topDropZone} aria-hidden />;
}

const useSectionCreateButtonStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    borderRadius: theme.shape.borderRadius,
    borderColor: primary[500],
    borderStyle: "dotted",
    backgroundColor: primary[50],
    padding: theme.spacing(2),
    width: "100%",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: primary[100],
    },
  },
}));

type SectionCreateButtonProps = React.HTMLAttributes<HTMLButtonElement>;

function SectionCreateButton(props: SectionCreateButtonProps) {
  const classes = useSectionCreateButtonStyles();
  return (
    <button className={classes.root} {...props}>
      <AddIcon htmlColor={primary[500]} />
      新しいセクション
    </button>
  );
}

const useDraggableSectionStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    padding: theme.spacing(2, 1),
    marginLeft: 25,
    marginBottom: theme.spacing(2),
    backgroundColor: gray[50],
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    "&:hover": {
      backgroundColor: gray[200],
    },
    "&:hover > $tab": {
      backgroundColor: gray[200],
    },
    "&:hover > [data-section-topics]:not(:hover) ~ $tab > $icon": {
      color: gray[700],
    },
  },
  icon: {
    color: gray[500],
  },
  tab: {
    display: "flex",
    alignItems: "center",
    position: "absolute",
    transform: "translateY(-50%)",
    top: "50%",
    left: -25,
    width: 25,
    height: "50%",
    minHeight: 50,
    border: `2px solid ${gray[200]}`,
    borderRight: "none",
    borderRadius: `4px 0 0 4px`,
    backgroundColor: gray[50],
    paddingLeft: theme.spacing(0.25),
  },
  drag: {
    backgroundColor: gray[200],
    "& $tab": {
      backgroundColor: gray[200],
      "& > $icon": {
        color: gray[700],
      },
    },
  },
}));

type DraggableSectionProps = {
  section: SectionSchema;
  children: React.ReactNode;
  onSectionUpdate(section: SectionSchema): void;
};

function SortableSection({
  section,
  children,
  onSectionUpdate,
}: DraggableSectionProps) {
  const classes = useDraggableSectionStyles();
  const id = sectionSortableId(section.id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "section", sectionId: section.id } satisfies SectionDragData,
  });
  const handleSectionNameChange = useDebouncedCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSectionUpdate({ ...section, name: event.target.value || null });
    },
    500
  );
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(classes.root, {
        [classes.drag]: isDragging,
      })}
      {...attributes}
      {...listeners}
    >
      {section.topics.length > 1 && (
        <SectionTextField
          label="セクション"
          fullWidth
          onChange={handleSectionNameChange}
          disabled={isDragging}
          defaultValue={section.name}
        />
      )}
      {children}
      <div className={classes.tab}>
        <DragIndicatorIcon className={classes.icon} fontSize="small" />
      </div>
    </div>
  );
}

function SectionTopicsDroppable({
  section,
  children,
}: Omit<DraggableSectionProps, "onSectionUpdate">) {
  const classes = useSectionTopicsDroppableStyles();
  const { setNodeRef } = useDroppable({
    id: sectionDroppableId(section.id),
    data: {
      type: "section-topics",
      sectionId: section.id,
    } satisfies SectionTopicsDragData,
  });
  return (
    <div ref={setNodeRef} data-section-topics className={classes.topics}>
      <SectionTopDroppable section={section} />
      {children}
    </div>
  );
}

function DragDropSection({
  section,
  children,
  onSectionUpdate,
}: DraggableSectionProps) {
  const topicIds = section.topics.map((topic) =>
    topicSortableId(section.id, topic.id)
  );
  return (
    <SortableSection section={section} onSectionUpdate={onSectionUpdate}>
      <SectionTopicsDroppable section={section}>
        <SortableContext
          items={topicIds}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>
      </SectionTopicsDroppable>
    </SortableSection>
  );
}

const useDraggableTopicStyles = makeStyles((theme) => ({
  root: {
    padding: `${theme.spacing(1)} 0`,
    display: "flex",
    alignItems: "center",
    "&:hover $icon": {
      color: gray[700],
    },
  },
  icon: {
    color: gray[500],
    flexShrink: 0,
  },
  drag: {
    backgroundColor: gray[200],
    "& $icon": {
      color: gray[700],
    },
  },
  dragging: {
    opacity: 0,
  },
  overlay: {
    backgroundColor: gray[200],
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    borderRadius: 4,
    cursor: "grabbing",
  },
}));

type DraggableTopicProps = {
  section: SectionSchema;
  topic: TopicSchema;
  onTopicRemove(topicSortableId: string): void;
};

function TopicDragPreview({ topic }: { topic: TopicSchema }) {
  const classes = useDraggableTopicStyles();
  return (
    <div className={clsx(classes.root, classes.overlay)}>
      <DragIndicatorIcon className={classes.icon} fontSize="small" />
      {topic.name}
    </div>
  );
}

function SortableTopic({ section, topic, onTopicRemove }: DraggableTopicProps) {
  const classes = useDraggableTopicStyles();
  const id = topicSortableId(section.id, topic.id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "topic",
      sectionId: section.id,
      topicId: topic.id,
    } satisfies TopicDragData,
  });
  const handleTopicRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onTopicRemove(id);
  };
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(classes.root, {
        [classes.drag]: isDragging,
        [classes.dragging]: isDragging,
      })}
      {...attributes}
      {...listeners}
    >
      <DragIndicatorIcon className={classes.icon} fontSize="small" />
      {topic.name}
      <RemoveButton variant="topic" onClick={handleTopicRemove} />
    </div>
  );
}

type DragEndHandler = (
  sections: SectionSchema[],
  index: { start: number; end: number },
  sectionId: { start: number; end: number }
) => SectionSchema[];

const handleSectionDragEnd: DragEndHandler = (sections, index) => {
  return reorder<SectionSchema>(sections, index.start, index.end);
};

const handleTopicDragEnd: DragEndHandler = (
  initialSections,
  index,
  sectionId
) => {
  const sections = initialSections.map((section) => ({
    ...section,
    topics: [...section.topics],
  }));
  const sectionIndex = {
    start: sections.findIndex(({ id }) => id === sectionId.start),
    end: sections.findIndex(({ id }) => id === sectionId.end),
  };
  const [topic] = sections[sectionIndex.start].topics.splice(index.start, 1);
  let insertIndex = index.end;
  if (sectionId.start === sectionId.end && index.start < insertIndex) {
    insertIndex -= 1;
  }
  sections[sectionIndex.end].topics.splice(insertIndex, 0, topic);

  if (sectionId.start === sectionId.end) {
    return sections;
  }

  // NOTE: SectionTextFieldが非表示のときセクションは無名として同期
  if (sections[sectionIndex.start].topics.length === 1) {
    sections[sectionIndex.start].name = null;
  }

  return sections;
};

const updateSection = (
  initialSections: SectionSchema[],
  section: SectionSchema
): SectionSchema[] => {
  const index = initialSections.findIndex(({ id }) => id === section.id);
  const sections = update(initialSections, index, section);
  return sections;
};

const removeTopic = (
  initialSections: SectionSchema[],
  topicId: string
): SectionSchema[] => {
  const match = topicId.match(/^topic-(\d+)-(\d+)$/);
  if (!match) return initialSections;
  const sectionId = Number(match[1]);
  const topicNumericId = Number(match[2]);
  const sections = [...initialSections];
  const sectionIndex = sections.findIndex(({ id }) => id === sectionId);
  if (sectionIndex === -1) return initialSections;
  const topicIndex = sections[sectionIndex].topics.findIndex(
    ({ id }) => id === topicNumericId
  );
  if (topicIndex === -1) return initialSections;
  const topics = remove(sections[sectionIndex].topics, topicIndex);
  sections[sectionIndex] = {
    ...sections[sectionIndex],
    topics,
  };
  return sections;
};

const removeSection = (
  initialSections: SectionSchema[],
  index: number
): SectionSchema[] => {
  const sections = remove(initialSections, index);
  return sections;
};

function getTopicDropTarget(
  sections: SectionSchema[],
  over: Over | null,
  active: Active
): { sectionId: number; index: number } | null {
  if (!over) return null;
  const data = over.data.current as DragData | undefined;
  if (data?.type === "section-top") {
    return { sectionId: data.sectionId, index: 0 };
  }
  if (data?.type === "topic") {
    const section = sections.find(({ id }) => id === data.sectionId);
    if (!section) return null;
    const index = section.topics.findIndex(({ id }) => id === data.topicId);
    if (index === -1) return null;
    return {
      sectionId: data.sectionId,
      index: getTopicInsertionIndex(over, active, index),
    };
  }
  if (data?.type === "section-topics") {
    const section = sections.find(({ id }) => id === data.sectionId);
    if (!section) return null;
    if (section.topics.length === 0) {
      return { sectionId: data.sectionId, index: 0 };
    }
    return {
      sectionId: data.sectionId,
      index: getTopicInsertionIndexInSection(section, over, active),
    };
  }
  return null;
}

const useStyles = makeStyles((theme) => ({
  container: {
    position: "relative",
  },
  placeholder: {
    margin: theme.spacing(1),
    color: gray[700],
  },
}));

function findActiveTopic(
  sections: SectionSchema[],
  data: TopicDragData
): TopicSchema | undefined {
  return sections
    .find(({ id }) => id === data.sectionId)
    ?.topics.find(({ id }) => id === data.topicId);
}

type Props = {
  sections: SectionSchema[];
  onSectionsUpdate(sections: SectionSchema[]): void;
  onSectionCreate(): void;
  boundaryRef?: RefObject<HTMLElement | null>;
};

export default function DraggableSections(props: Props) {
  const { sections, onSectionsUpdate, onSectionCreate, boundaryRef } = props;
  const classes = useStyles();
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const isInsideBoundsRef = useRef(true);
  const [activeData, setActiveData] = useState<DragData | null>(null);
  const [isInsideBounds, setIsInsideBounds] = useState(true);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const sectionIds = sections.map(({ id }) => sectionSortableId(id));
  const activeTopic =
    activeData?.type === "topic"
      ? findActiveTopic(sections, activeData)
      : undefined;

  useEffect(() => {
    if (!activeData) return;
    const handlePointerMove = (event: PointerEvent) => {
      const rect = (
        boundaryRef ?? internalContainerRef
      ).current?.getBoundingClientRect();
      if (!rect) return;
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      isInsideBoundsRef.current = inside;
      setIsInsideBounds(inside);
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [activeData, boundaryRef]);

  const resetDragState = () => {
    setActiveData(null);
    isInsideBoundsRef.current = true;
    setIsInsideBounds(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveData((event.active.data.current as DragData | undefined) ?? null);
    isInsideBoundsRef.current = true;
    setIsInsideBounds(true);
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    resetDragState();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!isInsideBoundsRef.current) {
      resetDragState();
      return;
    }
    resetDragState();
    if (!over || active.id === over.id) return;
    const activeDragData = active.data.current as DragData | undefined;
    const overData = over.data.current as DragData | undefined;
    if (activeDragData?.type === "section" && overData?.type === "section") {
      const startIndex = sections.findIndex(
        ({ id }) => id === activeDragData.sectionId
      );
      const endIndex = sections.findIndex(
        ({ id }) => id === overData.sectionId
      );
      if (startIndex === -1 || endIndex === -1) return;
      onSectionsUpdate(
        handleSectionDragEnd(
          sections,
          { start: startIndex, end: endIndex },
          { start: activeDragData.sectionId, end: overData.sectionId }
        )
      );
      return;
    }
    if (activeDragData?.type !== "topic") return;
    const sourceSection = sections.find(
      ({ id }) => id === activeDragData.sectionId
    );
    if (!sourceSection) return;
    const sourceIndex = sourceSection.topics.findIndex(
      ({ id }) => id === activeDragData.topicId
    );
    if (sourceIndex === -1) return;
    const destination = getTopicDropTarget(sections, over, active);
    if (!destination) return;
    onSectionsUpdate(
      handleTopicDragEnd(
        sections,
        { start: sourceIndex, end: destination.index },
        { start: activeDragData.sectionId, end: destination.sectionId }
      )
    );
  };
  const handleSectionUpdate = (section: SectionSchema) => {
    onSectionsUpdate(updateSection(sections, section));
  };
  const handleTopicRemove = (topicId: string) => {
    onSectionsUpdate(removeTopic(sections, topicId));
  };
  const handleSectionRemove = (index: number) => () => {
    onSectionsUpdate(removeSection(sections, index));
  };
  const handleSectionCreate = () => onSectionCreate();
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={topicCollisionDetection}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={boundaryRef ? undefined : internalContainerRef}
        className={classes.container}
      >
        <SortableContext
          items={sectionIds}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section, sectionIndex) => (
            <DragDropSection
              key={`${section.id}`}
              section={section}
              onSectionUpdate={handleSectionUpdate}
            >
              {section.topics.map((topic) => (
                <SortableTopic
                  key={topicSortableId(section.id, topic.id)}
                  section={section}
                  topic={topic}
                  onTopicRemove={handleTopicRemove}
                />
              ))}
              {section.topics.length === 0 && (
                <p className={classes.placeholder}>
                  ここにトピックをドロップ
                  <RemoveButton
                    variant="section"
                    onClick={handleSectionRemove(sectionIndex)}
                  />
                </p>
              )}
            </DragDropSection>
          ))}
        </SortableContext>
        <SectionCreateButton onClick={handleSectionCreate} />
      </div>
      <DragOverlay dropAnimation={null}>
        {isInsideBounds && activeTopic && (
          <TopicDragPreview topic={activeTopic} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
