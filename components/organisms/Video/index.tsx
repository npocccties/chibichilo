import React, { useCallback, useEffect, useState } from "react";
import usePrevious from "@rooks/use-previous";
import { css } from "@emotion/css";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { TopicSchema } from "$server/models/topic";
import type { VideoResourceSchema } from "$server/models/videoResource";
import VideoPlayer from "$organisms/Video/VideoPlayer";
import VideoResource from "$organisms/Video/VideoResource";
import { NEXT_PUBLIC_VIDEO_MAX_HEIGHT } from "$utils/env";
import { useVideoAtom } from "$store/video";
import { useBookAtom } from "$store/book";
import useOembed from "$utils/useOembed";
import type { SxProps } from "@mui/system";
import type { ActivitySchema } from "$server/models/activity";
import { isInstructor, isAdministrator } from "$utils/session";
import { useSessionAtom } from "$store/session";
import type { ButtonProps } from "@mui/material";
import { Box } from "@mui/material";
import { Chip, Typography } from "@mui/material";
import { Button } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { gray, learningStatus } from "$theme/colors";
import Markdown from "$atoms/Markdown";
import KeywordChip from "$atoms/KeywordChip";
import License from "$atoms/License";
import DescriptionList from "$atoms/DescriptionList";
import formatInterval from "$utils/formatInterval";
import getLocaleDateString from "$utils/getLocaleDateString";
import { authors } from "$utils/descriptionList";
import TagList from "$molecules/TagList";
import { useBookmarksByTopicId } from "$utils/bookmark/useBookmarks";

import { NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK } from "$utils/env";

const videoStyle = {
  "& > *": {
    /* NOTE: 各動画プレイヤーのレスポンシブ対応により、高さはpaddingTopによってwidthのpercentage分
     * 確保されるため、heightによる制限ではなくwidthによる制限をおこなう必要がある */
    // NOTE: 16:9前提になっているが本当はアスペクト比に応じて最大高さを変えたい
    maxWidth:
      NEXT_PUBLIC_VIDEO_MAX_HEIGHT === "unset"
        ? "unset"
        : `calc(${NEXT_PUBLIC_VIDEO_MAX_HEIGHT} * 16 / 9)`,
    margin: "0 auto",
  },
} as const;

const tabsStyle = css({
  marginBottom: "12px",
  borderBottom: `1px solid ${gray[300]}`,
});

const timeLineDetail = css({
  display: "flex",
  justifyContent: "center",
  marginTop: "12px",
});

const skipButton = css({
  whiteSpace: "nowrap",
  fontSize: "8px",
  marginRight: "8px",
  lineHeight: 1,
});

const markdownContainerStyle = css({
  wordBreak: "break-word",
  overflowWrap: "break-word",
});

function SkipButton(props: ButtonProps) {
  return (
    <Button {...props} className={skipButton} size="small" color="secondary">
      未視聴箇所へ
    </Button>
  );
}

// TODO:atomにコンポーネント化する
const useTabIndex = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabIndexChange = (
    _: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setTabIndex(value);
  };

  return { tabIndex, handleTabIndexChange };
};

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
      id={`panel-${index}`}
      aria-labelledby={`tab-${index}`}
      aria-hidden={value !== index}
      {...other}
    >
      {value === index && children}
    </div>
  );
}
// TODO:ここまで

type Props = {
  className?: string;
  sx?: SxProps;
  topic: TopicSchema;
  timeRange: ActivitySchema["timeRanges"];
  onEnded?: () => void;
  isPrivateBook?: boolean;
  isBookPage?: boolean;
};

/**
 * 再生終了時間が有効か否か
 * @return 有効かつ再生終了: true、それ以外: false
 */
function isValidPlaybackEnd({
  currentTime = 0,
  stopTime,
}: {
  currentTime: number | undefined;
  stopTime: number | null | undefined;
}): boolean {
  return typeof stopTime === "number" && 0 < stopTime && stopTime < currentTime;
}

const BAR_SIZE = 480;
function generateTimeRangeBarValue({
  timeRange,
  timeRequired,
}: {
  timeRange: ActivitySchema["timeRanges"];
  timeRequired: TopicSchema["timeRequired"];
}): Array<{ id: string; positionX: number; width: number }> {
  return timeRange.map((timeRange) => {
    const id = [timeRange?.activityId, timeRange?.startMs].join();
    const startMs = timeRange?.startMs || 0;
    const endMs = timeRange?.endMs || 0;
    const timeRadio = (endMs - startMs) / timeRequired / 1000;
    const width = BAR_SIZE * timeRadio;
    const lengthRatio = BAR_SIZE / timeRequired;
    const positionX = (lengthRatio * startMs) / 1000;

    return { id, positionX, width };
  });
}

export default function Video({
  className,
  sx,
  topic,
  timeRange,
  onEnded,
  isPrivateBook = false,
  isBookPage = false,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { video, preloadVideo } = useVideoAtom();
  const { book, itemIndex, itemExists } = useBookAtom();
  const { session } = useSessionAtom();

  /** 動画プレイヤーオブジェクトプールに読み込まれているか否か */
  const isLoadedVideoInstancePool = Boolean(
    book && video.has(String(topic.id))
  );

  useEffect(() => {
    if (!book) return;
    // バックグラウンドで動画プレイヤーオブジェクトプールに読み込む
    preloadVideo(book.sections);
    return () => video.clear();
  }, [book, preloadVideo, video]);

  const oembed = useOembed(topic.resource.id);
  const prevItemIndex = usePrevious(itemIndex);
  useEffect(() => {
    const topic = itemExists(itemIndex);
    const startTime = topic?.startTime;
    const stopTime = topic?.stopTime;
    if (prevItemIndex?.some((v, i) => v !== itemIndex[i])) {
      void video.get(String(itemExists(prevItemIndex)?.id))?.player.pause();
    }
    const videoInstance = video.get(String(topic?.id));
    if (!videoInstance) return;
    if (videoInstance.type === "vimeo") {
      videoInstance.player.on("timeupdate", async () => {
        const currentTime = await videoInstance.player.getCurrentTime();
        if (isValidPlaybackEnd({ currentTime, stopTime })) {
          void videoInstance.player.pause();
          onEnded?.();
        }
        // @ts-expect-error startTime is number
        if (Number.isFinite(startTime) && currentTime < startTime) {
          void videoInstance.player.setCurrentTime(startTime || 0);
        }
      });
      void videoInstance.player.setCurrentTime(startTime || 0);
      return;
    }

    const handleSeeked = () => {
      const currentTime = videoInstance.player.currentTime();
      // @ts-expect-error startTime is number
      if (Number.isFinite(startTime) && currentTime < startTime) {
        videoInstance.player.currentTime(startTime || 0);
      }
    };

    const handleTimeUpdate = () => {
      if (videoInstance.stopTimeOver) return;
      const currentTime = videoInstance.player.currentTime();
      if (isValidPlaybackEnd({ currentTime, stopTime })) {
        videoInstance.stopTimeOver = true;
        videoInstance.player.pause();
        onEnded?.();
      }
    };

    const handlePlay = () => {
      // 終了位置より後ろにシークすると、意図せず再生が再開してしまうことがあるので、ユーザーの操作によらない再生開始を抑制する
      if (videoInstance.stopTimeOver) videoInstance.player.pause();
    };

    const handleFirstPlay = () => {
      if (!videoInstance.firstPlay) return;

      // NOTE: 初回playイベントは再生位置を移動して再生する
      if (startTime && Number.isFinite(startTime)) {
        videoInstance.player.currentTime(startTime);
      }

      videoInstance.firstPlay = false;
    };

    const handleReady = () => {
      if (videoInstance.stopTimeOver) {
        if (Number.isFinite(startTime))
          videoInstance.player.currentTime(startTime || 0);
        videoInstance.stopTimeOver = false;
      }
      videoInstance.player.on("timeupdate", handleTimeUpdate);
      videoInstance.player.on("seeked", handleSeeked);
    };

    videoInstance.player.on("play", handlePlay);
    videoInstance.player.one("play", handleFirstPlay);
    videoInstance.player.ready(handleReady);

    return () => {
      videoInstance.player.off("timeupdate", handleTimeUpdate);
      videoInstance.player.off("seeked", handleSeeked);
      videoInstance.player.off("play", handlePlay);
      videoInstance.player.off("play", handleFirstPlay);
    };
    // TODO: videoの内容の変更検知は機能しないので修正したい。Mapオブジェクトでの管理をやめるかMap.prototype.set()を使用しないようにするなど必要かもしれない。
  }, [video, itemExists, prevItemIndex, itemIndex, onEnded]);

  const handleSkipWatch = useCallback(async () => {
    const videoInstance = video.get(String(topic?.id));
    if (!videoInstance) return;
    if (videoInstance.type === "vimeo") {
      const currentTime = await videoInstance.player.getCurrentTime();
      const nextUnwatchedTime = timeRange.find((timeRange) => {
        return (timeRange.endMs || 0) / 1000 > currentTime;
      });
      if (!nextUnwatchedTime?.endMs) return;
      void videoInstance.player.setCurrentTime(nextUnwatchedTime.endMs / 1000);
    } else {
      const nextUnwatchedTime = timeRange.find((timeRange) => {
        return (
          (timeRange.endMs || 0) / 1000 >
          (videoInstance.player.currentTime() ?? 0)
        );
      });
      if (!nextUnwatchedTime?.endMs) return;
      void videoInstance.player.currentTime(nextUnwatchedTime.endMs / 1000);
    }
  }, [timeRange, topic?.id, video]);

  const { tabIndex, handleTabIndexChange } = useTabIndex();
  const isStudent =
    session && !isInstructor(session) && !isAdministrator(session);

  const bookmarksByTopicId = useBookmarksByTopicId({
    topicId: topic.id,
  });

  const { bookmarks, bookmarkTagMenu, isLoading } =
    NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK
      ? bookmarksByTopicId
      : { bookmarks: [], bookmarkTagMenu: [], isLoading: false };

  return (
    <>
      {isLoadedVideoInstancePool ? (
        Array.from(video.entries()).map(([id, videoInstance]) => (
          <VideoPlayer
            key={id}
            sx={{
              ...videoStyle,
              ...sx,
              position: String(topic.id) === id ? "sticky" : "static",
              top: String(topic.id) === id ? (isMobile ? 0 : 56) : "auto",
              zIndex: String(topic.id) === id ? 10 : "auto",
              backgroundColor:
                String(topic.id) === id ? "#ffffff" : "transparent",
            }}
            videoInstance={videoInstance}
            autoplay={String(topic.id) === id}
            hidden={String(topic.id) !== id}
            onEnded={String(topic.id) === id ? onEnded : undefined}
          />
        ))
      ) : (
        <VideoResource
          className={className}
          sx={{ ...videoStyle, ...sx }}
          {...(topic.resource as VideoResourceSchema)}
          identifier={String(topic.id)}
          autoplay
          onEnded={onEnded}
          thumbnailUrl={oembed && oembed.thumbnail_url}
        />
      )}
      {NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK &&
        !isLoading &&
        isPrivateBook &&
        bookmarkTagMenu.length !== 0 && (
          <TagList
            key={topic.id}
            topicId={topic.id}
            bookmarks={bookmarks}
            tagMenu={bookmarkTagMenu}
          />
        )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Tabs
          aria-label="トピックビデオの詳細情報"
          className={tabsStyle}
          indicatorColor="primary"
          value={tabIndex}
          onChange={handleTabIndexChange}
          sx={{
            width: "80%",
          }}
        >
          <Tab label="解説" id="tab-0" aria-controls="panel-0" />
          {isStudent && isBookPage && (
            <Tab label="視聴時間詳細" id="tab-1" aria-controls="panel-1" />
          )}
          <Tab
            label="トピックの詳細"
            id={`tab-${isStudent ? 2 : 1}`}
            aria-controls={`panel-${isStudent ? 2 : 1}`}
          />
        </Tabs>
        {topic.license && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              height: "72px",
              mt: "-72px",
            }}
          >
            <License
              sx={{
                display: "inline-flex",
                alignItems: "center",
              }}
              license={topic.license}
            />
          </Box>
        )}
      </Box>
      <TabPanel value={tabIndex} index={0}>
        <article className={markdownContainerStyle}>
          <Markdown>{topic.description}</Markdown>
        </article>
      </TabPanel>
      {isStudent && isBookPage && (
        <TabPanel value={tabIndex} index={1} className={timeLineDetail}>
          <SkipButton onClick={handleSkipWatch} />
          <svg height={20} width={BAR_SIZE} xmlns="http://www.w3.org/2000/svg">
            <rect
              x={0}
              y={0}
              height={20}
              width={BAR_SIZE}
              stroke="black"
              fill="transparent"
            />
            {generateTimeRangeBarValue({
              timeRange,
              timeRequired: topic.timeRequired,
            }).map((value) => {
              return (
                <React.Fragment key={value.id}>
                  <rect
                    x={value.positionX}
                    width={value.width}
                    height={20}
                    fill={learningStatus.completed}
                  />
                </React.Fragment>
              );
            })}
          </svg>
        </TabPanel>
      )}
      <TabPanel value={tabIndex} index={isStudent ? 2 : 1}>
        <Typography
          sx={{
            display: "inline-block",
            verticalAlign: "middle",
            mr: 1,
            mb: 0.5,
          }}
          variant="h6"
        >
          {topic.name}
        </Typography>
        <Chip
          sx={{ mr: 1, mb: 0.5 }}
          label={`学習時間 ${formatInterval(0, topic.timeRequired * 1000)}`}
        />
        <DescriptionList
          inline
          value={[
            {
              key: "作成日",
              value: getLocaleDateString(topic.createdAt, "ja"),
            },
            {
              key: "更新日",
              value: getLocaleDateString(topic.updatedAt, "ja"),
            },
            // 著作権者または作成者
            ...(topic.licenser
              ? [{ key: "", value: topic.licenser }]
              : authors(topic)),
          ]}
        />
        {topic.keywords && (
          <Box sx={{ my: 1 }}>
            {topic.keywords.map((keyword) => {
              return (
                <KeywordChip
                  key={keyword.id}
                  keyword={keyword}
                  sx={{ mr: 0.5, maxWidth: "260px" }}
                />
              );
            })}
          </Box>
        )}
      </TabPanel>
    </>
  );
}
