import type { ReactNode } from "react";
import { useMemo, Fragment } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import makeStyles from "@mui/styles/makeStyles";
import Item from "$atoms/Item";
import LearningStatusChip from "$atoms/LearningStatusChip";
import getActivitiesEachCourseBooks from "$utils/getActivitiesEachCourseBooks";
import type { LearnerSchema } from "$server/models/learner";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { CourseBookSchema } from "$server/models/courseBook";
import { gray } from "$theme/colors";

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  bookTitle: {
    marginTop: theme.spacing(2),
  },
  topic: {
    "& > :not(:last-child)": {
      marginRight: theme.spacing(1),
    },
    "& > :first-child": {
      color: gray[900],
      fontSize: "1rem",
      lineHeight: 1.5,
    },
  },
  items: {
    marginTop: theme.spacing(0.25),
    "& > *": {
      display: "inline-block",
      marginRight: theme.spacing(1),
    },
  },
}));

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
  const classes = useStyles();
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
      <IconButton className={classes.closeButton} onClick={onClose}>
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
            <Typography className={classes.bookTitle} variant="h6">
              {book.name}
            </Typography>
            {activities.map((activity, index) => (
              <Fragment key={index}>
                <div className={classes.topic}>
                  <span>{activity.topic.name}</span>
                  <LearningStatusChip
                    type={activity.status}
                    size="small"
                    component="span"
                  />
                  <div className={classes.items}>
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
                  </div>
                </div>
              </Fragment>
            ))}
            {index < self.length - 1 && <Divider />}
          </Fragment>
        ))}
      </DialogContent>
    </Dialog>
  );
}
