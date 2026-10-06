import { useState, useMemo, useCallback } from "react";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import GetAppOutlinedIcon from "@mui/icons-material/GetAppOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import type { SxProps, Theme } from "@mui/material/styles";
import Container from "$atoms/Container";
import ActionHeader from "$organisms/ActionHeader";
import LearningStatusDot from "$atoms/LearningStatusDot";
import type { ActivityScope } from "$types/activityScope";
import ActivityScopeSelect from "$molecules/ActivityScopeSelect";
import LearningActivityItem from "$molecules/LearningActivityItem";
import BookAndTopicActivityItem from "$molecules/BookAndTopicActivityItem";
import LearnerActivityItem from "$molecules/LearnerActivityItem";
import LearnerActivityDialog from "$organisms/LearnerActivityDialog";
import card from "$styles/card";
import type { CourseBookSchema } from "$server/models/courseBook";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { BookSchema } from "$server/models/book";
import type { SessionSchema } from "$server/models/session";
import type { LearnerSchema } from "$server/models/learner";
import { gray } from "$theme/colors";
import downloadBookActivity from "$utils/bookLearningActivity/download";
import downloadBookmarkStats from "$utils/bookmark/download";
import label from "$utils/learningStatusLabel";
import rewatchLabel from "$utils/rewatchLabel";

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

import { tooltipMessage } from "$utils/tooltipMessage";
import { NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD } from "$utils/env";
import { NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK } from "$utils/env";

type TabPanelProps = {
  className?: string;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel({
  className,
  sx,
  children,
  value,
  index,
  ...other
}: TabPanelProps) {
  return (
    <Box
      component="div"
      className={className}
      sx={sx}
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel=${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && children}
    </Box>
  );
}

const contextLabelSx = {
  flexGrow: 1,
  fontSize: "0.875rem",
  color: gray[700],
};

const dashboardCardSx = {
  pt: 0,
};

const tabsSx = {
  m: (theme: Theme) => theme.spacing(0, -3, 2),
  borderBottom: `1px solid ${gray[300]}`,
};

const itemsSx = {
  "& > :not(:last-child)": {
    mb: 4,
  },
};

const learnersSx = {
  overflowX: "auto",
};

const learnersLabelSx = {
  mb: 2,
  position: "sticky",
  left: 0,
  "& > :not(:last-child)": {
    mr: 1.5,
  },
  "& > *": {
    display: "inline-flex",
    alignItems: "center",
    "& > :first-child": {
      mr: 0.5,
    },
  },
};

const topicLabelSx = {
  flex: 1,
  display: "flex",
  fontSize: "75%",
};

const topicTitleColumnSx = {
  width: "60%",
  mr: 1,
  alignItems: "center",
};

const topicTitleColumnLongSx = {
  width: "70%",
  mr: 1,
  alignItems: "center",
};

const topicColumnSx = {
  display: "flex",
  width: "10%",
  justifyContent: "center",
};

const topicDataDescriptionAreaSx = {
  textAlign: "right",
  fontSize: "50%",
  mb: "0.5em",
};

const topicDataDescriptionSx = {
  p: 0,
  m: 0,
};

const rewatchLabelSx = {
  fontSize: 14,
  lineHeight: "12px",
  fontWeight: 900, // Black (Heavy)
};

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
        learners,
        courseBooks,
        bookActivities,
      }),
    [learners, courseBooks, bookActivities]
  );

  const { data, dispatch, ...dialogProps } = useDialogProps<{
    learner: LearnerSchema;
    bookActivities: Array<BookActivitySchema>;
  }>();

  const [showMembersDialog, setShowMembersDialog] = useState(true);
  const [firstTime, setFirstTime] = useState(true);
  const handleCloseLtiMembers = useCallback(() => {
    setShowMembersDialog(false);
    setFirstTime(false);
  }, []);

  const handleUpdateLtiMembers = useCallback(
    async (members: LtiNrpsContextMemberSchema[] | undefined) => {
      if (members) {
        await updateLtiMembers({
          members,
          currentLtiContextOnly: scope === "current-lti-context-only",
        });
      }
      handleCloseLtiMembers();
    },
    [scope, updateLtiMembers, handleCloseLtiMembers]
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
    () => () => setShowMembersDialog(true),
    [setShowMembersDialog]
  );
  return (
    <Container maxWidth="md">
      <Typography sx={{ mt: 5 }} variant="h4">
        学習分析
      </Typography>
      <ActionHeader>
        <Typography variant="h6">{session.ltiContext.title}</Typography>
        <Box component="span" sx={contextLabelSx}>
          {session.ltiContext.label}
        </Box>
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
          onClick={handleMembershipClick()}
          color="primary"
          variant="contained"
          size="small"
        >
          <GroupOutlinedIcon fontSize="small" />
          受講者の同期
        </Button>
      </ActionHeader>
      <Card sx={[card, dashboardCardSx]}>
        <Tabs
          sx={tabsSx}
          indicatorColor="primary"
          value={tabIndex}
          onChange={handleChange}
        >
          <Tab label="ブック" />
          <Tab label="トピック" />
          <Tab label="学習者" />
          {NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK ? <Tab label="タグ" /> : ""}
        </Tabs>
        <TabPanel sx={itemsSx} value={tabIndex} index={0}>
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
          <Box sx={topicDataDescriptionAreaSx}>
            <Box component="p" sx={topicDataDescriptionSx}>
              ※
              平均学習完了率、平均繰返視聴割合の計算に未視聴の学習者は含みません
            </Box>
          </Box>
          <Box sx={topicLabelSx}>
            {NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD ? (
              <Box sx={topicTitleColumnSx}></Box>
            ) : (
              <Box sx={topicTitleColumnLongSx}></Box>
            )}

            <Box sx={topicColumnSx}>動画の長さ</Box>
            <Box sx={topicColumnSx}>未視聴</Box>
            <Box sx={topicColumnSx}>
              <Tooltip title={tooltipMessage.completeRate} arrow>
                <span>
                  平均学習
                  <br />
                  完了率
                </span>
              </Tooltip>
            </Box>
            {NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD ? (
              <Box sx={topicColumnSx}>
                <Tooltip title={tooltipMessage.rewatchRate} arrow>
                  <span>
                    平均繰返
                    <br />
                    視聴割合
                  </span>
                </Tooltip>
              </Box>
            ) : (
              ""
            )}
          </Box>
          {activitiesByBooksAndTopics.map((activitiesByBookAndTopic, index) => (
            <BookAndTopicActivityItem
              key={index}
              scope={scope === "current-lti-context-only"}
              book={activitiesByBookAndTopic}
              rewatchRates={rewatchRates?.activityRewatchRate ?? []}
            />
          ))}
        </TabPanel>
        <TabPanel sx={learnersSx} value={tabIndex} index={2}>
          <Box sx={learnersLabelSx}>
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
            <div>
              <Box component="span" sx={rewatchLabelSx}>
                {rewatchLabel}
              </Box>
              <span>繰返視聴</span>
            </div>
          </Box>
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
          <TabPanel sx={itemsSx} value={tabIndex} index={3}>
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
      <MembersDialog
        members={memberships?.members}
        newLtiMembers={newLtiMembers}
        handleUpdateLtiMembers={handleUpdateLtiMembers}
        onClose={handleCloseLtiMembers}
        open={showMembersDialog}
        firstTime={firstTime}
      />
    </Container>
  );
}
