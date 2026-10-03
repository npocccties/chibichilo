import type { ReactNode } from "react";
import { useMemo, Fragment } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import Item from "$atoms/Item";
import LearningStatusChip from "$atoms/LearningStatusChip";
import getActivitiesEachCourseBooks from "$utils/getActivitiesEachCourseBooks";
import type { LearnerSchema } from "$server/models/learner";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { CourseBookSchema } from "$server/models/courseBook";
import { gray } from "$theme/colors";

const closeButtonSx: SxProps<Theme> = {
  position: "absolute",
  top: 1,
  right: 1,
};

const bookTitleSx: SxProps<Theme> = {
  mt: 2,
};

const topicSx: SxProps<Theme> = {
  "& > :not(:last-child)": {
    mr: 1,
  },
  "& > :first-child": {
    color: gray[900],
    fontSize: "1rem",
    lineHeight: 1.5,
  },
};

const itemsSx: SxProps<Theme> = {
  mt: 0.25,
  "& > *": {
    display: "inline-block",
    mr: 1,
  },
};

type Props = {
  courseTitle: ReactNode;
  courseBooks: Array<CourseBookSchema>;
  learner: LearnerSchema;
  bookActivities: Array<BookActivitySchema>;
  open: boolean;
  onClose: React.MouseEventHandler;
};

export default function LearnerActivityDialog(props: Props) {
  const { courseTitle, courseBooks, learner, bookActivities, open, onClose } =
    props;
  const activitiesEachCourseBooks = useMemo(
    () =>
      getActivitiesEachCourseBooks({
        courseBooks,
        bookActivities,
      }),
    [courseBooks, bookActivities]
  );
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <IconButton sx={closeButtonSx} onClick={onClose}>
        <CloseIcon />
      </IconButton>
      <DialogTitle>
        <Typography variant="h5" component="p">
          {learner.name || "名前未公開"}
        </Typography>
        <Typography variant="subtitle1" component="p">
          {courseTitle}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {activitiesEachCourseBooks.map(([book, activities], index, self) => (
          <Fragment key={index}>
            <Typography sx={bookTitleSx} variant="h6">
              {book.name}
            </Typography>
            {activities.map((activity, index) => (
              <Fragment key={index}>
                <Box component="div" sx={topicSx}>
                  <span>{activity.topic.name}</span>
                  <LearningStatusChip
                    type={activity.status}
                    size="small"
                    component="span"
                  />
                  <Box component="div" sx={itemsSx}>
                    {activity.createdAt && (
                      <Item
                        itemKey="初回アクセス"
                        value={activity.createdAt.toLocaleString()}
                      />
                    )}
                    {activity.updatedAt && (
                      <Item
                        itemKey="最終アクセス"
                        value={activity.updatedAt.toLocaleString()}
                      />
                    )}
                  </Box>
                </Box>
              </Fragment>
            ))}
            {index < self.length - 1 && <Divider />}
          </Fragment>
        ))}
      </DialogContent>
    </Dialog>
  );
}
