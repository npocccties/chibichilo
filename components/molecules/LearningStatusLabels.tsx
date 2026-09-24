import { useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import type { Theme } from "@mui/material/styles";
import type { LearnerSchema } from "$server/models/learner";
import type { LearningStatus } from "$server/models/learningStatus";
import LearningStatusDot from "$atoms/LearningStatusDot";
import label from "$utils/learningStatusLabel";
import useSelectorProps from "$utils/useSelectorProps";
import { grey, common } from "@mui/material/colors";

const disabledButtonSx = {
  "&.Mui-disabled": {
    color: (theme: Theme) => theme.palette.text.primary,
  },
};

const rootSx = {
  "& > :not(:last-child)": {
    mr: 1.5,
  },
};

const itemSx = {
  display: "inline-flex",
  alignItems: "center",
  "& > :first-child": {
    mr: 0.5,
  },
};

const menuHeaderSx = {
  display: "flex",
  position: "sticky",
  backgroundColor: common.white,
  zIndex: 1,
  top: 0,
  alignItems: "center",
  margin: 0,
  p: (theme: Theme) => theme.spacing(1, 2),
  "& > :first-child": {
    mr: 0.5,
  },
  "& > h6": {
    margin: 0,
    fontSize: "0.875rem",
    color: grey[700],
  },
};

function LearningStatusLabel({
  status,
  label,
  learners,
  onLearnerClick,
}: {
  status: LearningStatus;
  label: string;
  learners: Array<LearnerSchema>;
  onLearnerClick?(learner: LearnerSchema): void;
}) {
  const { onOpen, onSelect, ...menuProps } = useSelectorProps<null>(null);
  const handleLearnerClick = useCallback(
    (learner: LearnerSchema) => () => {
      onLearnerClick?.(learner);
      onSelect(null);
    },
    [onSelect, onLearnerClick]
  );
  const clickable = learners.length > 0;

  return (
    <>
      <Box
        component="div"
        sx={[itemSx, clickable && { textDecoration: "underline" }]}
      >
        <LearningStatusDot status={status} />
        <Button
          sx={disabledButtonSx}
          aria-controls={`learner-activities-menu-${status}`}
          variant="text"
          disabled={!clickable}
          onClick={onOpen}
        >
          {label}
          {learners.length}人
        </Button>
      </Box>
      <Menu
        {...menuProps}
        id={`learner-activities-menu-${status}`}
        aria-haspopup="true"
      >
        <Box component="header" sx={menuHeaderSx}>
          <LearningStatusDot status={status} />
          <h6>
            {label}
            {learners.length}人
          </h6>
        </Box>
        {[...learners].map((learner) => (
          <MenuItem key={learner.id} onClick={handleLearnerClick(learner)}>
            {learner.name || "名前未公開"}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

type Props = {
  className?: string;
  learners: Array<LearnerSchema>;
  completedLearners: Array<LearnerSchema>;
  incompletedLearners: Array<LearnerSchema>;
  onLearnerClick?(learner: LearnerSchema): void;
};

export default function LearningStatusLabels(props: Props) {
  const {
    className,
    learners,
    completedLearners,
    incompletedLearners,
    onLearnerClick,
  } = props;
  const unopenedLearners = useMemo(() => {
    const map: Map<LearnerSchema["id"], LearnerSchema> = new Map(
      learners.map((learner) => [learner.id, learner])
    );
    [...completedLearners, ...incompletedLearners].forEach(({ id }) =>
      map.delete(id)
    );
    return map;
  }, [learners, completedLearners, incompletedLearners]);
  const items = useMemo(
    () =>
      [
        {
          status: "completed",
          label: label.completed,
          learners: completedLearners,
        },
        {
          status: "incompleted",
          label: label.incompleted,
          learners: incompletedLearners,
        },
        {
          status: "unopened",
          label: label.unopened,
          learners: Array.from(unopenedLearners.values()),
        },
      ] as const,
    [completedLearners, incompletedLearners, unopenedLearners]
  );

  return (
    <Box component="div" className={className} sx={rootSx}>
      {items.map((item, index) => (
        <LearningStatusLabel
          key={index}
          {...item}
          onLearnerClick={onLearnerClick}
        />
      ))}
    </Box>
  );
}
