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
import BookAndTopicActivityItem from "$molecules/BookAndTopicActivityItem";
import LearnerActivityItem from "$molecules/LearnerActivityItem";
import LearnerActivityDialog from "$organisms/LearnerActivityDialog";
import useCardStyles from "$styles/card";
import type { CourseBookSchema } from "$server/models/courseBook";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { BookSchema } from "$server/models/book";
import type { SessionSchema } from "$server/models/session";
import type { LearnerSchema } from "$server/models/learner";
import { gray } from "$theme/colors";
import downloadBookActivity from "$utils/bookLearningActivity/download";
import downloadBookmarkStats from "$utils/bookmark/download";
import label from "$utils/learningStatusLabel";
import getLearnerActivities from "$utils/getLearnerActivities";
import getActivitiesByBooks from "$utils/getActivitiesByBooks";
import getActivitiesByBooksAndTopics from "$utils/getActivitiesByBooksAndTopics";
import useDialogProps from "$utils/useDialogProps";
import useMemberships from "$utils/useMemberships";
import MembersDialog from "$organisms/MembersDialog";
import BookmarkStatsDialog from "$organisms/BookmarkStatsDialog";
import useLtiMembersHandler from "$utils/useLtiMembersHandler";
import type { LtiNrpsContextMemberSchema } from "$server/models/ltiNrpsContextMember";
import useRewatchRate from "$utils/useRewatchRate";

import { NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD } from "$utils/env";
import { NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK } from "$utils/env";

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
  topicLabel: {
    flex: 1,
    display: "flex",
  },
  topicTitleColumn: {
    width: "70%",
    marginRight: theme.spacing(1),
    alignItems: "center",
  },
  topicTitleColumnLong: {
    width: "80%",
    marginRight: theme.spacing(1),
    alignItems: "center",
  },
  topicColumn: {
    display: "flex",
    width: "10%",
    justifyContent: "center",
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
  const { session, learners, courseBooks, bookActivities, scope } = props;
  const { data: memberships } = useMemberships();
  const newLtiMembers = useMemo(() => {
    if (!memberships) {
      return [];
    }
    const { members, currentLtiMembers } = memberships;
    return members.filter((member) => {
      return currentLtiMembers?.every(
        (learner) => learner.userId !== member.user_id
      );
    });
  }, [memberships]);
  const updateLtiMembers = useLtiMembersHandler();
  const classes = useStyles();
  const cardClasses = useCardStyles();
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setTabIndex(value);
  };
  const handleBookActivityDownloadClick = useCallback(() => {
    void downloadBookActivity(
      bookActivities,
      "視聴分析データ.csv",
      session,
      scope === "current-lti-context-only"
    );
  }, [bookActivities, session, scope]);
  const handleBookmarkStatsDownloadClick = useCallback(async () => {
    await downloadBookmarkStats(
      "ブックマークの統計情報.csv",
      scope === "current-lti-context-only"
    );
  }, [scope]);
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

  const { data: rewatchRates } = useRewatchRate(
    scope === "current-lti-context-only"
  );

  const activitiesByBooksAndTopics = useMemo(
    () =>
      getActivitiesByBooksAndTopics({
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
    data: membersData,
    dispatch: membersDispatch,
    ...membersDialogProps
  } = useDialogProps<{
    members: LtiNrpsContextMemberSchema[];
  }>();

  const handleUpdateLtiMembers = useCallback(
    async (members: LtiNrpsContextMemberSchema[]) => {
      await updateLtiMembers({
        members,
        currentLtiContextOnly: scope === "current-lti-context-only",
      });
      membersDialogProps.onClose();
    },
    [membersDialogProps, scope, updateLtiMembers]
  );
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
    (members: LtiNrpsContextMemberSchema[]) => () =>
      membersDispatch({ members }),
    [membersDispatch]
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
          onClick={handleBookActivityDownloadClick}
          color="secondary"
          variant="contained"
          size="small"
          disabled={bookActivities.length === 0}
          title="事前に[受講者の同期]ボタンを押してからダウンロードしてください"
        >
          <GetAppOutlinedIcon fontSize="small" />
          視聴分析データをダウンロード
        </Button>
        {NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK && (
          <Button
            onClick={handleBookmarkStatsDownloadClick}
            color="secondary"
            variant="contained"
            size="small"
          >
            <GetAppOutlinedIcon fontSize="small" />
            ブックマークの統計情報をダウンロード
          </Button>
        )}
        <Button
          onClick={handleMembershipClick(memberships?.members || [])}
          color="primary"
          variant="contained"
          size="small"
        >
          <GroupOutlinedIcon fontSize="small" />
          受講者の同期
        </Button>
      </ActionHeader>
      <Card classes={cardClasses} className={classes.card}>
        <Tabs
          className={classes.tabs}
          indicatorColor="primary"
          value={tabIndex}
          onChange={handleChange}
        >
          <Tab label="ブック" />
          <Tab label="トピック" />
          <Tab label="学習者" />
          {NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK ? <Tab label="タグ" /> : ""}
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
        <TabPanel value={tabIndex} index={1}>
          <div className={classes.topicLabel}>
            {NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD ? (
              <div className={classes.topicTitleColumn}></div>
            ) : (
              <div className={classes.topicTitleColumnLong}></div>
            )}

            <div className={classes.topicColumn}>動画の長さ（秒）</div>
            <div className={classes.topicColumn}>平均学習完了率</div>
            {NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD ? (
              <div className={classes.topicColumn}>平均繰返視聴割合</div>
            ) : (
              ""
            )}
          </div>
          {activitiesByBooksAndTopics.map(
            (activitiesByBookAndTopics, index) => (
              <BookAndTopicActivityItem
                key={index}
                scope={scope === "current-lti-context-only"}
                book={activitiesByBookAndTopics}
                rewatchRates={rewatchRates?.activityRewatchRate ?? []}
              />
            )
          )}
        </TabPanel>
        <TabPanel className={classes.learners} value={tabIndex} index={2}>
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
              rewatchRates={rewatchRates?.activityRewatchRate ?? []}
            />
          ))}
        </TabPanel>
        {NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK ? (
          <TabPanel className={classes.items} value={tabIndex} index={3}>
            {activitiesByBooks.map((book, index) => (
              <BookmarkStatsDialog key={index} book={book} />
            ))}
          </TabPanel>
        ) : (
          ""
        )}
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
      {membersData && (
        <MembersDialog
          members={membersData.members}
          newLtiMembers={newLtiMembers}
          handleUpdateLtiMembers={handleUpdateLtiMembers}
          {...membersDialogProps}
        />
      )}
    </Container>
  );
}
