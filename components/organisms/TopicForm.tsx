import type { ChangeEvent } from "react";
import React from "react";
import { useCallback, useState } from "react";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Link from "@mui/material/Link";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import type { AccordionProps } from "@mui/material/Accordion";
import MuiAccordion from "@mui/material/Accordion";
import type { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import type { AccordionDetailsProps } from "@mui/material/AccordionDetails";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import Autocomplete from "$atoms/Autocomplete";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import clsx from "clsx";
import InputLabel from "$atoms/InputLabel";
import TextField from "$atoms/TextField";
import VideoEditor from "$molecules/VideoEditor";
import AuthorsInput from "$organisms/AuthorsInput";
import KeywordsInput from "$organisms/KeywordsInput";
import TimeRequiredInputControl from "$organisms/TopicForm/TimeRequiredInputControl";
import SubtitleChip from "$atoms/SubtitleChip";
import SubtitleUploadDialog from "$organisms/SubtitleUploadDialog";
import VideoResource from "$organisms/Video/VideoResource";
import useCardStyles from "styles/card";
import gray from "theme/colors/gray";
import type { TopicProps, TopicSchema } from "$server/models/topic";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import { useSessionAtom } from "$store/session";
import languages from "$utils/languages";
import providers from "$utils/providers";
import useVideoResourceProps from "$utils/useVideoResourceProps";
import usePaused from "$utils/video/usePaused";
import type { AuthorSchema } from "$server/models/author";
import type { TopicSubmitValues } from "$types/topicSubmitValues";
import { useAuthorsAtom } from "store/authors";
import { useVideoAtom } from "$store/video";
import { useVideoTrackAtom } from "$store/videoTrack";
import useKeywordsInput from "$utils/useKeywordsInput";
import { getReleaseFromRelatedBooks } from "$utils/release";

const useStyles = makeStyles((theme) => ({
  margin: {
    "& > :not(:first-child)": {
      marginTop: theme.spacing(2.5),
    },
  },
  labelDescription: {
    marginLeft: theme.spacing(0.75),
    color: gray[600],
  },
  divider: {
    margin: theme.spacing(0, -3, 0),
  },
  subtitles: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    "& > *": {
      marginRight: theme.spacing(1.75),
      marginBottom: theme.spacing(1),
    },
  },
  videoBox: {
    display: "flex",
    justifyContent: "center",
    "& > *": { width: "50%" },
  },
  localVideo: {
    width: "100%",
  },
  marginLeft: {
    marginLeft: theme.spacing(0.75),
  },
}));

const label = {
  create: "作成",
  update: "更新",
} as const;

type Props = {
  topic?: TopicSchema;
  submitResult: string;
  className?: string;
  variant?: "create" | "update";
  onSubmit?(topic: TopicSubmitValues): void;
  onSubtitleSubmit(videoTrack: VideoTrackProps): void;
  onSubtitleDelete(videoTrack: VideoTrackSchema): void;
  onAuthorsUpdate(authors: AuthorSchema[]): void;
  onAuthorSubmit(author: Pick<AuthorSchema, "email">): void;
};

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion {...props} />
))({
  boxShadow: "none",
  "&:before": {
    display: "none",
  },
});

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  padding: 0,
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper": {
    margin: theme.spacing(1),
  },
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
}));

const AccordionDetails = styled((props: AccordionDetailsProps) => (
  <MuiAccordionDetails {...props} />
))(({ theme }) => ({
  "& > :not(:first-child)": {
    marginTop: theme.spacing(2.5),
  },
}));

export default function TopicForm(props: Props) {
  const {
    topic,
    submitResult,
    className,
    variant = "create",
    onSubmit = () => undefined,
    onSubtitleSubmit,
    onSubtitleDelete,
    onAuthorsUpdate,
    onAuthorSubmit,
  } = props;
  const cardClasses = useCardStyles();
  const classes = useStyles();
  const { session } = useSessionAtom();
  const { videoResource, setUrl } = useVideoResourceProps(topic?.resource);
  const handleResourceUrlChange = useDebouncedCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue("timeRequired", 0);
      setUrl(event.target.value);
    },
    500
  );
  const handleFileChange = useDebouncedCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event?.target?.files?.length) {
        setValue("timeRequired", 0);
        const file = event.target.files[0] as unknown as File;
        setDataUrl(URL.createObjectURL(file));
      }
    },
    500
  );
  const { video } = useVideoAtom();
  const localVideo = React.createRef<HTMLVideoElement>();
  const { videoTracks } = useVideoTrackAtom();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"url" | "file">("url");
  const [dataUrl, setDataUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [inPreview, setInPreview] = useState(false);
  const [videoChanged, setVideoChanged] = useState(false);
  const [startTimeError, setStartTimeError] = useState(false);
  const [startTimeMax, setStartTimeMax] = useState(0.001);
  const [stopTimeError, setStopTimeError] = useState(false);
  const [stopTimeMin, setStopTimeMin] = useState(0.001);
  const [stopTimeMax, setStopTimeMax] = useState(0.001);
  const handleClickSubtitle = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleSubtitleSubmit = (videoTrack: VideoTrackProps) => {
    onSubtitleSubmit(videoTrack);
    setOpen(false);
  };
  const handleSubtitleDelete = (videoTrack: VideoTrackSchema) => {
    onSubtitleDelete(videoTrack);
  };
  const { updateState: _updateState, ...authorsInputProps } = useAuthorsAtom();
  const keywordsInputProps = useKeywordsInput(topic?.keywords ?? []);
  const uploadProviders: { [key: string]: string } = {};
  // TODO: wowza 以外のサービスのサポート
  if (session?.systemSettings?.wowzaUploadEnabled) {
    uploadProviders.wowza = "https://www.wowza.com/";
  }
  const defaultValues = {
    name: topic?.name,
    description: topic?.description ?? "",
    shared: Boolean(topic?.shared),
    language: topic?.language ?? Object.getOwnPropertyNames(languages)[0],
    license: topic?.license ?? "",
    timeRequired: topic?.timeRequired,
    startTime: topic?.startTime,
    stopTime: topic?.stopTime,
    provider: Object.values(uploadProviders)[0] ?? "",
  };
  const { handleSubmit, register, control, getValues, setValue } = useForm<
    Omit<TopicProps, "resource"> & {
      provider: string;
      files?: FileList;
    }
  >({
    defaultValues,
  });
  register("timeRequired", { valueAsNumber: true });
  const setStartStopMinMax = useCallback(
    (topic: Pick<TopicProps, "startTime" | "stopTime">, duration: number) => {
      const roundedDuration = Math.floor(duration * 1000) / 1000;
      setStopTimeMax(roundedDuration);

      const startMax =
        Math.floor(
          // @ts-expect-error TODO: Object is possibly 'null' or 'undefined'
          (Math.min(topic.stopTime, roundedDuration) || roundedDuration) *
            1000 -
            1
        ) / 1000;
      setStartTimeMax(startMax);
      const stopMin =
        // @ts-expect-error TODO: Object is possibly 'null' or 'undefined'
        Math.floor((Math.max(topic.startTime, 0) || 0) * 1000 + 1) / 1000;
      setStopTimeMin(stopMin);

      setStartTimeError(
        Number.isFinite(topic.startTime) &&
          // @ts-expect-error TODO: Object is possibly 'null' or 'undefined'
          (0 > topic.startTime || topic.startTime > startMax)
      );
      setStopTimeError(
        Number.isFinite(topic.stopTime) &&
          // @ts-expect-error TODO: Object is possibly 'null' or 'undefined'
          (roundedDuration < topic.stopTime || topic.stopTime < stopMin)
      );
    },
    []
  );
  const getDuration = useCallback(async () => {
    if (method == "url") {
      const videoInstance = video.get(videoResource?.url ?? "");
      if (videoInstance?.type == "vimeo")
        return await videoInstance.player.getDuration();
      else return videoInstance?.player.duration() ?? 0;
    } else {
      return localVideo.current?.duration ?? 0;
    }
  }, [method, video, videoResource, localVideo]);
  const handleDurationChange = useCallback(
    async (changedDuration: number) => {
      const newDuration = changedDuration || (await getDuration());

      if (Number.isFinite(newDuration) && newDuration > 0) {
        const topic = getValues();
        setDuration(newDuration);
        setStartStopMinMax(topic, newDuration);

        if (
          Number.isFinite(changedDuration) &&
          changedDuration > 0 &&
          topic.timeRequired <= 0
        ) {
          setVideoChanged(Boolean(topic.startTime || topic.stopTime));
          setValue("timeRequired", Math.floor(newDuration));
          setValue("startTime", NaN);
          setValue("stopTime", NaN);
        }
      }
    },
    [getDuration, getValues, setValue, setStartStopMinMax]
  );
  const getPlayer = useCallback(() => {
    if (method == "url") return video.get(videoResource?.url ?? "")?.player;
    else return localVideo.current;
  }, [method, video, videoResource, localVideo]);
  const [paused, onTogglePause] = usePaused(getPlayer);
  const handleTimeUpdate = useCallback(
    async (currentTime: number) => {
      const topic = getValues();
      if (inPreview && currentTime >= (topic.stopTime || duration)) {
        setInPreview(false);
        void getPlayer()?.pause();
      }
    },
    [getValues, getPlayer, duration, inPreview, setInPreview]
  );
  const getCurrentTime = useCallback(async () => {
    if (method == "url") {
      const videoInstance = video.get(videoResource?.url ?? "");
      if (videoInstance?.type == "vimeo")
        return await videoInstance.player.getCurrentTime();
      else return videoInstance?.player.currentTime() ?? 0;
    } else {
      return localVideo.current?.currentTime ?? 0;
    }
  }, [method, video, videoResource, localVideo]);
  const setCurrentTime = useCallback(
    async (currentTime: number) => {
      if (method == "url") {
        const videoInstance = video.get(videoResource?.url ?? "");
        if (videoInstance?.type == "vimeo")
          await videoInstance.player.setCurrentTime(currentTime);
        else videoInstance?.player.currentTime(currentTime);
      } else {
        const currentLocalVideo = localVideo.current;
        if (currentLocalVideo) currentLocalVideo.currentTime = currentTime;
      }
    },
    [method, video, videoResource, localVideo]
  );
  const handleSeekToStart = useCallback(async () => {
    const player = getPlayer();
    if (!player) return;
    const topic = getValues();
    const startTime: number = topic.startTime || 0;
    await setCurrentTime(startTime);
  }, [getPlayer, getValues, setCurrentTime]);
  const handleSeekToEnd = useCallback(async () => {
    const player = getPlayer();
    if (!player) return;
    const topic = getValues();
    const endTime: number = topic.stopTime || 0;
    if (endTime === 0) {
      const duration = await getDuration();
      // NOTE: Video.js で duration を指定すると意図しない位置のまま停止されるので対処
      await setCurrentTime(duration - 1);
      void player.play();
    } else {
      await setCurrentTime(endTime);
    }
  }, [getPlayer, getValues, getDuration, setCurrentTime]);
  const handleStartTimeStopTimeChange = useCallback(async () => {
    setVideoChanged(false);
    const topic = getValues();
    setValue(
      "timeRequired",
      Math.floor((topic.stopTime || duration) - (topic.startTime || 0))
    );
    setStartStopMinMax(topic, duration);
  }, [duration, getValues, setValue, setStartStopMinMax]);
  const handleSetStartTime = useCallback(async () => {
    setValue("startTime", Math.floor((await getCurrentTime()) * 1000) / 1000);
    void handleStartTimeStopTimeChange();
  }, [setValue, getCurrentTime, handleStartTimeStopTimeChange]);
  const handleSetStopTime = useCallback(async () => {
    setValue("stopTime", Math.floor((await getCurrentTime()) * 1000) / 1000);
    void handleStartTimeStopTimeChange();
  }, [setValue, getCurrentTime, handleStartTimeStopTimeChange]);
  const released = Boolean(getReleaseFromRelatedBooks(topic?.relatedBooks));

  return (
    <>
      <Card
        classes={cardClasses}
        className={clsx(classes.margin, className)}
        component="form"
        onSubmit={handleSubmit((values) => {
          onSubmit({
            ...values,
            resource: videoResource ?? { url: "" },
            file: (method === "file" && values.files?.item(0)) || undefined,
            keywords: keywordsInputProps.keywords,
            authors: authorsInputProps.authors,
          });
        })}
      >
        {!released && topic?.shared && (
          <div>
            トピックのシェア機能は廃止されました。第三者にコンテンツを提供する場合は、コンテンツをリリースして、共有を有効にしてください。
            <FormControlLabel
              className={classes.marginLeft}
              label="上記のメッセージを、表示しないようにする"
              title={"メッセージを表示しない"}
              control={
                <Checkbox
                  onChange={(_, checked) => setValue("shared", !checked)}
                  defaultChecked={!defaultValues.shared}
                  color="primary"
                />
              }
            />
          </div>
        )}
        <TextField
          inputProps={register("name")}
          label="タイトル"
          required={!released}
          fullWidth
          disabled={released}
        />
        {!released && Boolean(Object.entries(uploadProviders).length) && (
          <>
            <FormLabel>動画の指定方法</FormLabel>
            <RadioGroup
              defaultValue="url"
              row
              onChange={(event, value) => setMethod(value as "url" | "file")}
            >
              <FormControlLabel value="url" control={<Radio />} label="URL" />
              <FormControlLabel
                value="file"
                control={<Radio />}
                label="ファイルアップロード"
              />
            </RadioGroup>
          </>
        )}
        {(released || method === "url") && (
          <>
            <Autocomplete
              id="resource.url"
              freeSolo
              options={[...Object.values(providers)].map(
                ({ baseUrl }) => baseUrl
              )}
              defaultValue={topic?.resource.url}
              disabled={released}
              renderInput={({ InputProps, inputProps }) => (
                <TextField
                  InputProps={{ ref: InputProps.ref }}
                  inputProps={inputProps}
                  name="resource.url"
                  label={
                    <>
                      動画のURL
                      <Typography
                        className={classes.labelDescription}
                        variant="caption"
                        component="span"
                      >
                        {[...Object.values(providers)]
                          .map(({ name }) => name)
                          .join(", ")}
                        に対応しています
                      </Typography>
                    </>
                  }
                  type="url"
                  required={!released}
                  fullWidth
                  onChange={handleResourceUrlChange}
                  disabled={released}
                />
              )}
            />
            {videoResource && (
              <div className={classes.videoBox}>
                <VideoResource
                  {...videoResource}
                  identifier={videoResource.url}
                  autoplay
                  onDurationChange={handleDurationChange}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
            )}
          </>
        )}
        {method === "file" && (
          <>
            <TextField
              label="動画ファイル"
              type="file"
              required
              inputProps={register("files")}
              onChange={handleFileChange}
            />
            <TextField
              label="動画ファイルをアップロードするサービス"
              select
              required
              defaultValue={defaultValues.provider}
              inputProps={register("provider")}
            >
              {Object.entries(uploadProviders).map(([label, value]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            {dataUrl && (
              <div className={classes.videoBox}>
                <video
                  ref={localVideo}
                  className={classes.localVideo}
                  src={dataUrl}
                  controls
                  autoPlay
                  onDurationChange={(event) => {
                    const video = event.target as HTMLVideoElement;
                    void handleDurationChange(video.duration);
                  }}
                  onTimeUpdate={(event) => {
                    const video = event.target as HTMLVideoElement;
                    void handleTimeUpdate(video.currentTime);
                  }}
                />
              </div>
            )}
          </>
        )}
        {!released && (videoResource || dataUrl) && (
          <Accordion>
            <AccordionSummary>
              <Typography>動画を編集する</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <VideoEditor
                onSetStartTime={handleSetStartTime}
                onSetStopTime={handleSetStopTime}
                onSeekToStart={handleSeekToStart}
                onSeekToEnd={handleSeekToEnd}
                onStartTimeStopTimeChange={handleStartTimeStopTimeChange}
                onTogglePause={onTogglePause}
                startTimeInputProps={register("startTime", {
                  valueAsNumber: true,
                })}
                stopTimeInputProps={register("stopTime", {
                  valueAsNumber: true,
                })}
                startTimeMax={startTimeMax}
                stopTimeMin={stopTimeMin}
                stopTimeMax={stopTimeMax}
                startTimeError={startTimeError}
                stopTimeError={stopTimeError}
                paused={paused}
              />
              <div className={classes.subtitles}>
                <InputLabel>字幕</InputLabel>
                <div className={classes.subtitles}>
                  {videoTracks.map((track) => (
                    <SubtitleChip
                      key={track.id}
                      videoTrack={track}
                      onDelete={handleSubtitleDelete}
                    />
                  ))}
                </div>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleClickSubtitle}
                >
                  字幕を追加
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
        )}
        {videoChanged && (
          <Alert severity="warning" onClose={() => setVideoChanged(false)}>
            動画が変更されました。再生開始位置と終了位置を再設定してください。
          </Alert>
        )}
        <TimeRequiredInputControl
          topic={topic}
          name="timeRequired"
          control={control}
          disabled={released}
        />
        <AuthorsInput
          {...authorsInputProps}
          onAuthorsUpdate={onAuthorsUpdate}
          onAuthorSubmit={onAuthorSubmit}
          disabled={released}
        />
        <KeywordsInput {...keywordsInputProps} disabled={released} />
        <TextField
          label="解説"
          fullWidth
          multiline
          inputProps={register("description")}
          disabled={released}
        />
        <Typography
          className={classes.labelDescription}
          variant="caption"
          component="span"
        >
          <Link
            href="https://github.github.com/gfm/"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Flavored Markdown
          </Link>
          {` `}
          に一部準拠しています
        </Typography>
        <Divider className={classes.divider} />
        <Button variant="contained" color="primary" type="submit">
          {label[variant]}
        </Button>
        {submitResult && <Alert severity="error">{submitResult}</Alert>}
      </Card>
      <SubtitleUploadDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubtitleSubmit}
      />
    </>
  );
}
