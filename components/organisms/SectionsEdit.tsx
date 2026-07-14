import clsx from "clsx";
import { useRef } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import FormControlLabel, {
  formControlLabelClasses,
} from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import GetAppIcon from "@mui/icons-material/GetApp";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import type { SxProps, Theme } from "@mui/material/styles";
import SectionsTree from "$molecules/SectionsTree";
import DraggableSections from "$molecules/DraggableSections";
import type { SectionSchema } from "$server/models/book/section";
import type { TopicSchema } from "$server/models/topic";
import type { IsContentEditable } from "$server/models/content";
import card from "$styles/card";
import useSortableSectionsProps from "$utils/useSortableSectionsProps";

const dividerSx: SxProps<Theme> = { m: (theme) => theme.spacing(0, -3, 2) };
const iconSx: SxProps<Theme> = { mr: 0.5 };
const itemsSx: SxProps<Theme> = {
  mx: -1,
  "& > *": { mr: 1.75, mb: 1 },
};
const footerSx: SxProps<Theme> = {
  backgroundColor: "#fff",
  position: "sticky",
  bottom: "0px",
  zIndex: 1,
  m: (theme) => theme.spacing(2, -3, -2),
  p: (theme) => theme.spacing(0, 3, 2),
  borderRadius: "0 0 12px 12px",
  "& > :not(hr)": { mr: 1.75 },
};
const rootSx: SxProps<Theme> = { ...card, overflow: "visible" };

type Props = {
  sections: SectionSchema[];
  className?: string;
  onBookImportClick?(): void;
  onTopicImportClick?(): void;
  onTopicNewClick?(): void;
  onSectionsUpdate(sections: SectionSchema[]): void;
  onTopicPreviewClick(topic: TopicSchema): void;
  onTopicEditClick?(topic: TopicSchema): void;
  isContentEditable?: IsContentEditable;
  noedit?: boolean;
};

export default function SectionsEdit(props: Props) {
  const {
    sections,
    className,
    onTopicPreviewClick,
    onTopicEditClick,
    onSectionsUpdate,
    isContentEditable,
    noedit,
  } = props;
  const handleItem =
    (handler?: (topic: TopicSchema) => void) =>
    ([sectionIndex, topicIndex]: ItemIndex) =>
      handler?.(sections[sectionIndex].topics[topicIndex]);
  const {
    sortable,
    sortableSections,
    inProgress,
    handleSortableChange,
    handleSectionsUpdate,
    handleSectionsReset,
    handleSectionsSave,
    handleSectionCreate,
  } = useSortableSectionsProps(sections, onSectionsUpdate);
  const dragBoundaryRef = useRef<HTMLDivElement>(null);
  return (
    <Card sx={rootSx} className={clsx(className)}>
      {!noedit && (
        <>
          <Box sx={itemsSx}>
            <Button
              size="small"
              color="primary"
              disabled={sortable}
              onClick={props.onBookImportClick}
            >
              <GetAppIcon sx={iconSx} />
              ブックの再利用
            </Button>
            <Button
              size="small"
              color="primary"
              disabled={sortable}
              onClick={props.onTopicImportClick}
            >
              <GetAppIcon sx={iconSx} />
              トピックの再利用
            </Button>
            <Button
              size="small"
              color="primary"
              disabled={sortable}
              onClick={props.onTopicNewClick}
            >
              <AddIcon sx={iconSx} />
              トピックの作成
            </Button>
            <FormControlLabel
              sx={{
                [`&.${formControlLabelClasses.labelPlacementStart}`]: { ml: 0 },
              }}
              control={
                <Switch
                  size="small"
                  color="primary"
                  checked={sortable}
                  onChange={handleSortableChange}
                />
              }
              label={
                <Typography
                  sx={{ display: "flex", alignItems: "center" }}
                  variant="button"
                  color="primary"
                >
                  <DragIndicatorIcon />
                  トピック順の編集
                </Typography>
              }
              labelPlacement="start"
            />
          </Box>
          <Divider sx={dividerSx} />
        </>
      )}
      {inProgress && (
        <Alert sx={{ mb: 2 }} severity="info">
          トピック順の編集内容が未保存です。反映する場合はトピック順の編集中に保存ボタンをクリックしてください
        </Alert>
      )}
      {sortable && (
        <div ref={dragBoundaryRef}>
          <DraggableSections
            sections={sortableSections}
            onSectionsUpdate={handleSectionsUpdate}
            onSectionCreate={handleSectionCreate}
            boundaryRef={dragBoundaryRef}
          />
          <Box sx={footerSx}>
            <Divider sx={dividerSx} />
            <Button
              color="primary"
              variant="text"
              onClick={handleSectionsReset}
            >
              編集前にリセット
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={handleSectionsSave}
            >
              保存
            </Button>
          </Box>
        </div>
      )}
      {!sortable && sections.length === 0 && (
        <Typography component="p" sx={{ m: 0 }}>
          動画は「トピック」という名前の単位で登録されています。
          <br />
          既存のトピックを再利用する、あるいは新たにトピック作成し、ここにトピックを追加してブックを完成してください。
        </Typography>
      )}
      {!sortable && sections.length > 0 && (
        <SimpleTreeView
          slots={{
            collapseIcon: ExpandMoreIcon,
            expandIcon: ChevronRightIcon,
          }}
          disableSelection
        >
          <SectionsTree
            sections={sections}
            onItemPreviewClick={handleItem(onTopicPreviewClick)}
            onItemEditClick={handleItem(onTopicEditClick)}
            isContentEditable={isContentEditable}
          />
        </SimpleTreeView>
      )}
    </Card>
  );
}
