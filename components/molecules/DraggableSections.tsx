import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
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
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
  type MeasuringConfiguration,
  type Over,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState, type RefObject } from "react";
import useDebouncedCallback from "$utils/useDebouncedCallback";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { styled } from "@mui/material/styles";
import RemoveButton from "$atoms/RemoveButton";
import SectionTextField from "$atoms/SectionTextField";
import type { SectionSchema } from "$server/models/book/section";
import type { TopicSchema } from "$server/models/topic";
import { gray, primary } from "$theme/colors";
import reorder, { insert, update, remove } from "$utils/reorder";

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

// ドラッグ中にトピックを別セクションへ移すとレイアウトが変わるため、ドロップ先の位置を測り直す
const measuring: MeasuringConfiguration = {
  droppable: { strategy: MeasuringStrategy.Always },
};

// 先頭へのドロップ判定を上側余白まで広げる
// セクションの padding (theme.spacing(2)) を超えると前のセクションとの隙間に重なる
const TOP_INSERT_MARGIN = 16;

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
  active: Active,
  topMargin: number
): number {
  const overRect = over.rect;
  const activeMidY = getActiveMidY(active);
  if (!overRect || activeMidY === null) return section.topics.length;

  const effectiveTop = overRect.top - topMargin;
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

const SectionTopicsRoot = styled("div")({
  position: "relative",
});

const SectionTopDropZone = styled("div")({
  position: "absolute",
  top: `${-TOP_INSERT_MARGIN}px`,
  left: 0,
  right: 0,
  height: TOP_INSERT_MARGIN,
  pointerEvents: "none",
});

function SectionTopDroppable({ section }: { section: SectionSchema }) {
  const { setNodeRef } = useDroppable({
    id: `section-top-${section.id}`,
    data: {
      type: "section-top",
      sectionId: section.id,
    } satisfies SectionTopDragData,
  });
  return <SectionTopDropZone ref={setNodeRef} aria-hidden />;
}

const SectionCreateButtonRoot = styled("button")(({ theme }) => ({
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
}));

type SectionCreateButtonProps = React.HTMLAttributes<HTMLButtonElement>;

function SectionCreateButton(props: SectionCreateButtonProps) {
  return (
    <SectionCreateButtonRoot {...props}>
      <AddIcon htmlColor={primary[500]} />
      新しいセクション
    </SectionCreateButtonRoot>
  );
}

const sectionDragIconSx = {
  color: gray[500],
};

const SectionTab = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  position: "absolute",
  transform: "translateY(-50%)",
  top: "50%",
  left: "-25px",
  width: 25,
  height: "50%",
  minHeight: 50,
  border: `2px solid ${gray[200]}`,
  borderRight: "none",
  borderRadius: `4px 0 0 4px`,
  backgroundColor: gray[50],
  paddingLeft: theme.spacing(0.25),
}));

const SortableSectionRoot = styled("div", {
  shouldForwardProp: (prop) => prop !== "isDragging",
})<{ isDragging?: boolean }>(({ theme, isDragging }) => ({
  position: "relative",
  padding: theme.spacing(2, 1),
  marginLeft: "25px",
  marginBottom: theme.spacing(2),
  backgroundColor: gray[50],
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  "&:hover": {
    backgroundColor: gray[200],
  },
  [`&:hover > ${SectionTab}`]: {
    backgroundColor: gray[200],
  },
  [`&:hover > [data-section-topics]:not(:hover) ~ ${SectionTab} .MuiSvgIcon-root`]:
    {
      color: gray[700],
    },
  ...(isDragging
    ? {
        backgroundColor: gray[200],
        [`& ${SectionTab}`]: {
          backgroundColor: gray[200],
          "& .MuiSvgIcon-root": {
            color: gray[700],
          },
        },
      }
    : {}),
}));

type DraggableSectionProps = {
  section: SectionSchema;
  children: React.ReactNode;
  showSectionName: boolean;
  onSectionUpdate(section: SectionSchema): void;
};

function SortableSection({
  section,
  children,
  showSectionName,
  onSectionUpdate,
}: DraggableSectionProps) {
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
    <SortableSectionRoot
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    >
      {showSectionName && (
        <SectionTextField
          label="セクション"
          fullWidth
          onChange={handleSectionNameChange}
          disabled={isDragging}
          defaultValue={section.name}
        />
      )}
      {children}
      <SectionTab>
        <DragIndicatorIcon sx={sectionDragIconSx} fontSize="small" />
      </SectionTab>
    </SortableSectionRoot>
  );
}

function SectionTopicsDroppable({
  section,
  children,
}: Pick<DraggableSectionProps, "section" | "children">) {
  const { setNodeRef } = useDroppable({
    id: sectionDroppableId(section.id),
    data: {
      type: "section-topics",
      sectionId: section.id,
    } satisfies SectionTopicsDragData,
  });
  return (
    <SectionTopicsRoot ref={setNodeRef} data-section-topics>
      <SectionTopDroppable section={section} />
      {children}
    </SectionTopicsRoot>
  );
}

function DragDropSection({
  section,
  children,
  showSectionName,
  topicIds,
  onSectionUpdate,
}: DraggableSectionProps & { topicIds: string[] }) {
  return (
    <SortableSection
      section={section}
      showSectionName={showSectionName}
      onSectionUpdate={onSectionUpdate}
    >
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

const topicDragIconSx = {
  color: gray[500],
  flexShrink: 0,
};

const SortableTopicRoot = styled("div", {
  shouldForwardProp: (prop) => prop !== "isDragging",
})<{ isDragging?: boolean }>(({ theme, isDragging }) => ({
  padding: `${theme.spacing(1)} 0`,
  display: "flex",
  alignItems: "center",
  "&:hover .MuiSvgIcon-root": {
    color: gray[700],
  },
  ...(isDragging
    ? {
        backgroundColor: gray[200],
        opacity: 0,
        "& .MuiSvgIcon-root": {
          color: gray[700],
        },
      }
    : {}),
}));

const TopicDragPreviewRoot = styled("div")(({ theme }) => ({
  padding: `${theme.spacing(1)} 0`,
  display: "flex",
  alignItems: "center",
  backgroundColor: gray[200],
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  borderRadius: "4px",
  cursor: "grabbing",
}));

type DraggableTopicProps = {
  id: string;
  section: SectionSchema;
  topic: TopicSchema;
  onTopicRemove(topicSortableId: string): void;
};

function TopicDragPreview({ topic }: { topic: TopicSchema }) {
  return (
    <TopicDragPreviewRoot>
      <DragIndicatorIcon sx={topicDragIconSx} fontSize="small" />
      {topic.name}
    </TopicDragPreviewRoot>
  );
}

function SortableTopic({
  id,
  section,
  topic,
  onTopicRemove,
}: DraggableTopicProps) {
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
    <SortableTopicRoot
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    >
      <DragIndicatorIcon sx={topicDragIconSx} fontSize="small" />
      {topic.name}
      <RemoveButton variant="topic" onClick={handleTopicRemove} />
    </SortableTopicRoot>
  );
}

const handleSectionDragEnd = (
  sections: SectionSchema[],
  index: { start: number; end: number }
): SectionSchema[] => {
  return reorder<SectionSchema>(sections, index.start, index.end);
};

/** セクション内のトピックの位置 (同じトピックが複数のセクションに含まれうるため id ではなく位置で扱う) */
type TopicLocation = { sectionId: number; index: number };

/** 別のセクションへトピックを移す。to.index は移動先セクション内の挿入位置 */
const moveTopicToSection = (
  initialSections: SectionSchema[],
  from: TopicLocation,
  to: TopicLocation
): SectionSchema[] => {
  const fromIndex = initialSections.findIndex(
    ({ id }) => id === from.sectionId
  );
  const toIndex = initialSections.findIndex(({ id }) => id === to.sectionId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return initialSections;
  }
  const topic = initialSections[fromIndex].topics[from.index];
  if (!topic) return initialSections;
  const sections = [...initialSections];
  sections[fromIndex] = {
    ...sections[fromIndex],
    topics: remove(sections[fromIndex].topics, from.index),
  };
  sections[toIndex] = {
    ...sections[toIndex],
    topics: insert(sections[toIndex].topics, to.index, topic),
  };
  return sections;
};

/** start の位置のトピックを end の位置へ移す */
const reorderTopicInSection = (
  initialSections: SectionSchema[],
  sectionId: number,
  start: number,
  end: number
): SectionSchema[] => {
  const sectionIndex = initialSections.findIndex(({ id }) => id === sectionId);
  if (sectionIndex === -1) return initialSections;
  const { topics } = initialSections[sectionIndex];
  if (!topics[start] || !topics[end] || start === end) return initialSections;
  return update(initialSections, sectionIndex, {
    ...initialSections[sectionIndex],
    topics: reorder(topics, start, end),
  });
};

/** 移動元セクションが1トピックだけになったら無名にする */
const syncSourceSectionName = (
  sections: SectionSchema[],
  sourceSectionId: number
): SectionSchema[] => {
  const index = sections.findIndex(({ id }) => id === sourceSectionId);
  if (index === -1 || sections[index].topics.length !== 1) return sections;
  // NOTE: SectionTextFieldが非表示のときセクションは無名として同期
  return update(sections, index, { ...sections[index], name: null });
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
    const index =
      getSortableIndex(over.data.current) ??
      section.topics.findIndex(({ id }) => id === data.topicId);
    if (index === -1) return null;
    return {
      sectionId: data.sectionId,
      index: getTopicInsertionIndex(over, active, index),
    };
  }
  if (data?.type === "section-topics" || data?.type === "section") {
    const section = sections.find(({ id }) => id === data.sectionId);
    if (!section) return null;
    if (section.topics.length === 0) {
      return { sectionId: data.sectionId, index: 0 };
    }
    // セクション枠の余白へのドロップもそのセクションへのグループ化として扱う
    const topMargin = data.type === "section" ? 0 : TOP_INSERT_MARGIN;
    return {
      sectionId: data.sectionId,
      index: getTopicInsertionIndexInSection(section, over, active, topMargin),
    };
  }
  return null;
}

const DraggableSectionsContainer = styled("div")({
  position: "relative",
});

const SectionPlaceholder = styled("p")(({ theme }) => ({
  margin: theme.spacing(1),
  color: gray[700],
}));

/** useSortable が data に付与する SortableContext 内の位置 */
function getSortableIndex(data: unknown): number | undefined {
  const index = (data as { sortable?: { index?: unknown } } | undefined)
    ?.sortable?.index;
  return typeof index === "number" && index >= 0 ? index : undefined;
}

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
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const isInsideBoundsRef = useRef(true);
  const [activeData, setActiveData] = useState<DragData | null>(null);
  const [isInsideBounds, setIsInsideBounds] = useState(true);
  /** トピックのドラッグ中に、別セクションへ移した状態を表示するためのセクション */
  const [previewSections, setPreviewSections] = useState<
    SectionSchema[] | null
  >(null);
  /** ドラッグ中のトピックの現在 (プレビュー上) の位置 */
  const [previewLocation, setPreviewLocation] = useState<TopicLocation | null>(
    null
  );
  // 移動直後のレイアウト変化で移動元へ戻る判定が起きて往復しないようにする
  const recentlyMovedRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const displaySections = previewSections ?? sections;
  const sectionIds = displaySections.map(({ id }) => sectionSortableId(id));
  const activeTopic =
    activeData?.type === "topic"
      ? findActiveTopic(sections, activeData)
      : undefined;
  const activeTopicSortableId =
    activeData?.type === "topic"
      ? topicSortableId(activeData.sectionId, activeData.topicId)
      : null;
  // 別セクションへ移してもドラッグ中のトピックの id は変えない (dnd-kit がドラッグ対象を見失うため)
  const getTopicSortableId = (
    sectionId: number,
    topicId: number,
    index: number
  ) =>
    activeTopicSortableId &&
    previewLocation?.sectionId === sectionId &&
    previewLocation.index === index
      ? activeTopicSortableId
      : topicSortableId(sectionId, topicId);
  // セクション名欄の表示切替でドラッグ中にレイアウトがずれないよう、ドラッグ開始時の状態で判定する
  const showSectionName = (section: SectionSchema) =>
    (sections.find(({ id }) => id === section.id) ?? section).topics.length > 1;

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
    setPreviewSections(null);
    setPreviewLocation(null);
    recentlyMovedRef.current = false;
    isInsideBoundsRef.current = true;
    setIsInsideBounds(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = (event.active.data.current as DragData | undefined) ?? null;
    const index = getSortableIndex(event.active.data.current);
    setActiveData(data);
    setPreviewSections(null);
    setPreviewLocation(
      data?.type === "topic" && index !== undefined
        ? { sectionId: data.sectionId, index }
        : null
    );
    isInsideBoundsRef.current = true;
    setIsInsideBounds(true);
  };

  const updatePreview = ({ active, over }: DragMoveEvent | DragOverEvent) => {
    if (!previewLocation) return;
    if (!over || over.id === active.id || recentlyMovedRef.current) return;
    const overData = over.data.current as DragData | undefined;
    const destination = getTopicDropTarget(displaySections, over, active);
    if (!destination) return;
    if (destination.sectionId === previewLocation.sectionId) {
      // 同じセクション内のトピック上では SortableContext が並びをプレビューする
      if (overData?.type === "topic") return;
      // destination.index は移動前の並びにおける挿入位置
      const index =
        previewLocation.index < destination.index
          ? destination.index - 1
          : destination.index;
      if (index === previewLocation.index) return;
      setPreviewSections(
        reorderTopicInSection(
          displaySections,
          previewLocation.sectionId,
          previewLocation.index,
          index
        )
      );
      setPreviewLocation({ sectionId: previewLocation.sectionId, index });
    } else {
      setPreviewSections(
        moveTopicToSection(displaySections, previewLocation, destination)
      );
      setPreviewLocation(destination);
    }
    recentlyMovedRef.current = true;
    requestAnimationFrame(() => {
      recentlyMovedRef.current = false;
    });
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    resetDragState();
  };

  const handleTopicDragEnd = (
    { active, over }: DragEndEvent,
    sourceSectionId: number,
    location: TopicLocation
  ) => {
    let next = displaySections;
    let sectionId = location.sectionId;
    const overData = over?.data.current as DragData | undefined;
    if (over && over.id !== active.id) {
      const overIndex = getSortableIndex(over.data.current);
      if (
        overData?.type === "topic" &&
        overData.sectionId === sectionId &&
        overIndex !== undefined
      ) {
        next = reorderTopicInSection(
          next,
          sectionId,
          location.index,
          overIndex
        );
      } else {
        const destination = getTopicDropTarget(next, over, active);
        if (destination && destination.sectionId !== sectionId) {
          next = moveTopicToSection(next, location, destination);
          sectionId = destination.sectionId;
        } else if (destination) {
          // destination.index は移動前の並びにおける挿入位置
          const end =
            location.index < destination.index
              ? destination.index - 1
              : destination.index;
          next = reorderTopicInSection(next, sectionId, location.index, end);
        }
      }
    }
    if (next === sections) return;
    if (sectionId !== sourceSectionId) {
      next = syncSourceSectionName(next, sourceSectionId);
    }
    onSectionsUpdate(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!isInsideBoundsRef.current) {
      resetDragState();
      return;
    }
    resetDragState();
    if (activeData?.type === "topic") {
      if (previewLocation) {
        handleTopicDragEnd(event, activeData.sectionId, previewLocation);
      }
      return;
    }
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
        handleSectionDragEnd(sections, { start: startIndex, end: endIndex })
      );
    }
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
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={updatePreview}
      onDragOver={updatePreview}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <DraggableSectionsContainer
        ref={boundaryRef ? undefined : internalContainerRef}
      >
        <SortableContext
          items={sectionIds}
          strategy={verticalListSortingStrategy}
        >
          {displaySections.map((section, sectionIndex) => (
            <DragDropSection
              key={`${section.id}`}
              section={section}
              showSectionName={showSectionName(section)}
              topicIds={section.topics.map((topic, index) =>
                getTopicSortableId(section.id, topic.id, index)
              )}
              onSectionUpdate={handleSectionUpdate}
            >
              {section.topics.map((topic, index) => (
                <SortableTopic
                  key={getTopicSortableId(section.id, topic.id, index)}
                  id={getTopicSortableId(section.id, topic.id, index)}
                  section={section}
                  topic={topic}
                  onTopicRemove={handleTopicRemove}
                />
              ))}
              {section.topics.length === 0 && (
                <SectionPlaceholder>
                  ここにトピックをドロップ
                  <RemoveButton
                    variant="section"
                    onClick={handleSectionRemove(sectionIndex)}
                  />
                </SectionPlaceholder>
              )}
            </DragDropSection>
          ))}
        </SortableContext>
        <SectionCreateButton onClick={handleSectionCreate} />
      </DraggableSectionsContainer>
      <DragOverlay dropAnimation={null}>
        {isInsideBounds && activeTopic && (
          <TopicDragPreview topic={activeTopic} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
