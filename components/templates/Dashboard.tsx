import { useState, useMemo, useCallback } from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import GetAppOutlinedIcon from "@mui/icons-material/GetAppOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import makeStyles from "@mui/styles/makeStyles";
import Container from "$atoms/Container";
import ActionHeader from "$organisms/ActionHeader";
import LearningStatusDot from "$atoms/LearningStatusDot";
import type { ActivityScope } from "$types/activityScope";
import ActivityScopeSelect from "$molecules/ActivityScopeSelect";
import LearningActivityItem from "$molecules/LearningActivityItem";
import LearnerActivityItem from "$molecules/LearnerActivityItem";
import LearnerActivityDialog from "$organisms/LearnerActivityDialog";
import useCardStyles from "$styles/card";
import type { CourseBookSchema } from "$server/models/courseBook";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { BookSchema } from "$server/models/book";
import type { SessionSchema } from "$server/models/session";
import type { LearnerSchema } from "$server/models/learner";
import { gray } from "$theme/colors";
import download from "$utils/bookLearningActivity/download";
import label from "$utils/learningStatusLabel";
import getLearnerActivities from "$utils/getLearnerActivities";
import getActivitiesByBooks from "$utils/getActivitiesByBooks";
import useDialogProps from "$utils/useDialogProps";
import useMemberships from "$utils/useMemberships";
import MembershipsDialog from "$organisms/MembershipsDialog";
import type { LtiMemberShipSchema } from "$server/models/ltiMemberShip";
import useLtiMembersHandler from "$utils/useLtiMembersHandler";

type TabPanelProps = {
  className?: string;
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel({
  className,
  children,
  value,
  index,
  ...other
}: TabPanelProps) {
  return (
    <div
      className={className}
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel=${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  contextLabel: {
    flexGrow: 1,
    fontSize: "0.875rem",
    color: gray[700],
  },
  card: {
    paddingTop: 0,
  },
  tabs: {
    margin: theme.spacing(0, -3, 2),
    borderBottom: `1px solid ${gray[300]}`,
  },
  items: {
    "& > :not(:last-child)": {
      marginBottom: theme.spacing(4),
    },
  },
  learners: {
    overflowX: "auto",
  },
  learnersLabel: {
    marginBottom: theme.spacing(2),
    position: "sticky",
    left: 0,
    "& > :not(:last-child)": {
      marginRight: theme.spacing(1.5),
    },
    "& > *": {
      display: "inline-flex",
      alignItems: "center",
      "& > :first-child": {
        marginRight: theme.spacing(0.5),
      },
    },
  },
}));

type Props = {
  session: SessionSchema;
  learners: Array<LearnerSchema>;
  courseBooks: Array<CourseBookSchema>;
  bookActivities: Array<BookActivitySchema>;
  scope: ActivityScope;
  onScopeChange(activityScope: ActivityScope): void;
};

export default function Dashboard(props: Props) {
  const { session, learners, courseBooks, bookActivities } = props;
  const { data: memberships } = useMemberships();
  const updateLtiMembers = useLtiMembersHandler();
  const classes = useStyles();
  const cardClasses = useCardStyles();
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setTabIndex(value);
  };
  const handleDownloadClick = useCallback(() => {
    void download(bookActivities, "分析データ.csv", session);
  }, [bookActivities, session]);
  const learnerActivities = useMemo(
    () =>
      getLearnerActivities({
        learners,
        courseBooks,
        bookActivities,
      }),
    [learners, courseBooks, bookActivities]
  );
  const activitiesByBooks = useMemo(
    () =>
      getActivitiesByBooks({
        courseBooks,
        bookActivities,
      }),
    [courseBooks, bookActivities]
  );
  const { data, dispatch, ...dialogProps } = useDialogProps<{
    learner: LearnerSchema;
    bookActivities: Array<BookActivitySchema>;
  }>();
  const {
    data: membershipData,
    dispatch: membershipDispatch,
    ...membershipDialogProps
  } = useDialogProps<{
    memberships: LtiMemberShipSchema;
  }>();
  const handleLearnerClick = useCallback(
    (book: Pick<BookSchema, "id">) => (learner: LearnerSchema) =>
      dispatch({
        learner,
        bookActivities: learnerActivities
          .filter(([{ id }]) => id === learner.id)
          .flatMap(([, a]) => a.filter((a) => a.book.id === book.id)),
      }),
    [learnerActivities, dispatch]
  );
  const handleActivityClick = useCallback(
    (learner: LearnerSchema, bookActivities: Array<BookActivitySchema>) => () =>
      dispatch({ learner, bookActivities }),
    [dispatch]
  );
  const handleMembershipClick = useCallback(
    (memberships: LtiMemberShipSchema) => () =>
      // TODO：membershipのデータを渡すのではなく、LSMユーザーとchibi-chiloのltiMemberとの差分のデータを渡す
      membershipDispatch({ memberships }),
    [membershipDispatch]
  );
  return (
    <Container maxWidth="md">
      <Typography sx={{ mt: 5 }} variant="h4">
        学習分析
      </Typography>
      <ActionHeader>
        <Typography variant="h6">{session.ltiContext.title}</Typography>
        <span className={classes.contextLabel}>{session.ltiContext.label}</span>
        <ActivityScopeSelect
          value={props.scope}
          onActivityScopeChange={props.onScopeChange}
        />
        <Button
          onClick={handleDownloadClick}
          color="secondary"
          variant="contained"
          size="small"
          disabled={bookActivities.length === 0}
        >
          <GetAppOutlinedIcon fontSize="small" />
          分析データをダウンロード
        </Button>
        {memberships && (
          <Button
            onClick={handleMembershipClick(memberships)}
            color="primary"
            variant="contained"
            size="small"
            disabled={bookActivities.length === 0}
          >
            <GroupOutlinedIcon fontSize="small" />
            受講者を同期
          </Button>
        )}
      </ActionHeader>
      <Card classes={cardClasses} className={classes.card}>
        <Tabs
          className={classes.tabs}
          indicatorColor="primary"
          value={tabIndex}
          onChange={handleChange}
        >
          <Tab label="ブック" />
          <Tab label="学習者" />
        </Tabs>
        <TabPanel className={classes.items} value={tabIndex} index={0}>
          {activitiesByBooks.map((activitiesByBook, index) => (
            <LearningActivityItem
              key={index}
              learners={learners}
              book={activitiesByBook}
              completedLearners={activitiesByBook.completedLearners}
              incompletedLearners={activitiesByBook.incompletedLearners}
              onLearnerClick={handleLearnerClick(activitiesByBook)}
            />
          ))}
        </TabPanel>
        <TabPanel className={classes.learners} value={tabIndex} index={1}>
          <div className={classes.learnersLabel}>
            <div>
              <LearningStatusDot status="completed" />
              <span>{label.completed}</span>
            </div>
            <div>
              <LearningStatusDot status="incompleted" />
              <span>{label.incompleted}</span>
            </div>
            <div>
              <LearningStatusDot status="unopened" />
              <span>{label.unopened}</span>
            </div>
          </div>
          {learnerActivities.map(([learner, activities], index) => (
            <LearnerActivityItem
              key={index}
              learner={learner}
              activities={activities}
              onActivityClick={handleActivityClick(learner, activities)}
              session={session}
            />
          ))}
        </TabPanel>
      </Card>
      {data && (
        <LearnerActivityDialog
          courseTitle={session.ltiContext.title}
          courseBooks={courseBooks}
          learner={data.learner}
          bookActivities={data.bookActivities}
          {...dialogProps}
        />
      )}
      {membershipData && (
        <MembershipsDialog
          // TODO：membershipのデータを渡すのではなく、LSMユーザーとchibi-chiloのltiMemberとの差分のデータを渡す
          memberships={membershipData.memberships}
          updateLtiMembers={updateLtiMembers}
          {...membershipDialogProps}
        />
      )}
    </Container>
  );
}
