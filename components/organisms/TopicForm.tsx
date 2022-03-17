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
import makeStyles from "@mui/styles/makeStyles";
import Autocomplete from "$atoms/Autocomplete";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import clsx from "clsx";
import InputLabel from "$atoms/InputLabel";
import TextField from "$atoms/TextField";
import AuthorsInput from "$organisms/AuthorsInput";
import KeywordsInput from "$organisms/KeywordsInput";
import SubtitleChip from "$atoms/SubtitleChip";
import SubtitleUploadDialog from "$organisms/SubtitleUploadDialog";
import VideoResource from "$organisms/Video/VideoResource";
import useCardStyles from "styles/card";
import gray from "theme/colors/gray";
import type { TopicPropsWithUpload, TopicSchema } from "$server/models/topic";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import { useSessionAtom } from "$store/session";
import { NEXT_PUBLIC_API_BASE_PATH } from "$utils/env";
import languages from "$utils/languages";
import licenses from "$utils/licenses";
import providers from "$utils/providers";
import useVideoResourceProps from "$utils/useVideoResourceProps";
import type { AuthorSchema } from "$server/models/author";
import type { TopicPropsWithUploadAndAuthors } from "$types/topicPropsWithAuthors";
import { useAuthorsAtom } from "store/authors";
import { useVideoAtom } from "$store/video";
import { useVideoTrackAtom } from "$store/videoTrack";
import useKeywordsInput from "$utils/useKeywordsInput";

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
  localVideo: {
    width: "100%",
  },
  videoButtons: {
    marginRight: theme.spacing(2),
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
  onSubmit?(topic: TopicPropsWithUploadAndAuthors): void;
  onSubtitleSubmit(videoTrack: VideoTrackProps): void;
  onSubtitleDelete(videoTrack: VideoTrackSchema): void;
  onAuthorsUpdate(authors: AuthorSchema[]): void;
  onAuthorSubmit(author: Pick<AuthorSchema, "email">): void;
};

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
      setValue("topic.timeRequired", 0);
      setUrl(event.target.value);
    },
    500
  );
  const handleFileChange = useDebouncedCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event?.target?.files?.length) {
        setValue("topic.timeRequired", 0);
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
  const [method, setMethod] = useState("url");
  const [dataUrl, setDataUrl] = useState("");
  const [startTimeError, setStartTimeError] = useState(false);
  const [stopTimeError, setStopTimeError] = useState(false);
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
  if (session?.systemSettings?.wowzaUploadEnabled) {
    uploadProviders.wowza = "https://www.wowza.com/";
  }
  const defaultValues = {
    topic: {
      name: topic?.name,
      description: topic?.description ?? "",
      shared: Boolean(topic?.shared),
      language: topic?.language ?? Object.getOwnPropertyNames(languages)[0],
      license: topic?.license ?? "",
      timeRequired: topic?.timeRequired,
      startTime: topic?.startTime,
      stopTime: topic?.stopTime,
    },
    provider: Object.values(uploadProviders)[0] ?? "",
    wowzaBaseUrl: `${NEXT_PUBLIC_API_BASE_PATH}/api/v2/wowza`,
    fileName: "",
    fileContent: "",
  };
  const { handleSubmit, register, getValues, setValue } = useForm<
    Omit<TopicPropsWithUpload, "resource">
  >({
    defaultValues,
  });
  const handleDurationChange = useCallback(
    (duration: number) => {
      if (!Number.isFinite(duration)) return;
      const { topic } = getValues();
      if (topic.timeRequired > 0) return;
      setValue("topic.timeRequired", Math.floor(duration));
      setValue("topic.startTime", null);
      setValue("topic.stopTime", null);
    },
    [getValues, setValue]
  );
  const getPlayer = useCallback(() => {
    if (method == "url") return video.get(videoResource?.url ?? "")?.player;
    else return localVideo.current;
  }, [method, video, videoResource, localVideo]);
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
  const addPlayerEventListener = useCallback(
    (type: string, listener: EventListener) => {
      if (method == "url")
        video.get(videoResource?.url ?? "")?.player.on(type, listener);
      else localVideo.current?.addEventListener(type, listener);
    },
    [method, video, videoResource, localVideo]
  );
  const removePlayerEventListener = useCallback(
    (type: string, listener: EventListener) => {
      if (method == "url")
        video.get(videoResource?.url ?? "")?.player.off(type, listener);
      else localVideo.current?.removeEventListener(type, listener);
    },
    [method, video, videoResource, localVideo]
  );
  const handlePreview = useCallback(async () => {
    const player = getPlayer();
    if (!player) return;

    const { topic } = getValues();
    const duration = await getDuration();
    const handleTimeUpdate = async () => {
      const currentTime = await getCurrentTime();
      if (currentTime >= (topic.stopTime || duration)) {
        void player.pause();
        removePlayerEventListener("timeupdate", handleTimeUpdate);
      }
    };
    removePlayerEventListener("timeupdate", handleTimeUpdate);
    addPlayerEventListener("timeupdate", handleTimeUpdate);
    await setCurrentTime(topic.startTime || 0);
    void player.play();
  }, [
    getPlayer,
    getValues,
    getDuration,
    getCurrentTime,
    removePlayerEventListener,
    addPlayerEventListener,
    setCurrentTime,
  ]);
  const handleStartTimeStopTimeChange = useCallback(async () => {
    const duration = await getDuration();
    const { topic } = getValues();
    setValue(
      "topic.timeRequired",
      Math.floor((topic.stopTime || duration) - (topic.startTime || 0))
    );
    setStartTimeError(
      Number.isFinite(topic.startTime) &&
        // eslint-disable-next-line tsc/config
        (0 > topic.startTime || topic.startTime >= (topic.stopTime || duration))
    );
    setStopTimeError(
      Number.isFinite(topic.stopTime) &&
        // eslint-disable-next-line tsc/config
        (duration < topic.stopTime || topic.stopTime <= (topic.startTime || 0))
    );
  }, [getDuration, getValues, setValue]);
  const handleSetStartTime = useCallback(async () => {
    setValue(
      "topic.startTime",
      Math.floor((await getCurrentTime()) * 1000) / 1000
    );
    void handleStartTimeStopTimeChange();
  }, [setValue, getCurrentTime, handleStartTimeStopTimeChange]);
  const handleSetStopTime = useCallback(async () => {
    setValue(
      "topic.stopTime",
      Math.floor((await getCurrentTime()) * 1000) / 1000
    );
    void handleStartTimeStopTimeChange();
  }, [setValue, getCurrentTime, handleStartTimeStopTimeChange]);

  return (
    <>
      <Card
        classes={cardClasses}
        className={clsx(classes.margin, className)}
        component="form"
        onSubmit={handleSubmit((values) => {
          const resource = videoResource ?? { url: "" };
          if (method == "file" && values?.fileContent?.length) {
            const file = values.fileContent[0] as unknown as File;
            const reader = new FileReader();
            reader.addEventListener(
              "load",
              () => {
                onSubmit({
                  topic: {
                    ...values.topic,
                    resource,
                    keywords: keywordsInputProps.keywords,
                  },
                  authors: authorsInputProps.authors,
                  provider: values.provider,
                  wowzaBaseUrl: values.wowzaBaseUrl,
                  fileName: file.name,
                  fileContent: Buffer.from(
                    reader.result as ArrayBuffer
                  ).toString("base64"),
                });
              },
              false
            );
            reader.readAsArrayBuffer(file);
          } else {
            onSubmit({
              topic: {
                ...values.topic,
                resource,
                keywords: keywordsInputProps.keywords,
              },
              authors: authorsInputProps.authors,
              provider: "",
              wowzaBaseUrl: "",
              fileName: "",
              fileContent: "",
            });
          }
        })}
      >
        <TextField
          inputProps={register("topic.name")}
          label={
            <>
              タイトル
              <Typography
                className={classes.labelDescription}
                variant="caption"
                component="span"
              >
                学習者が学習範囲を簡潔に理解できるタイトルを設定できます
              </Typography>
            </>
          }
          required
          fullWidth
        />
        <AuthorsInput
          {...authorsInputProps}
          onAuthorsUpdate={onAuthorsUpdate}
          onAuthorSubmit={onAuthorSubmit}
        />
        <div>
          <InputLabel htmlFor="shared">他の教員にシェア</InputLabel>
          <Checkbox
            id="shared"
            name="shared"
            onChange={(_, checked) => setValue("topic.shared", checked)}
            defaultChecked={defaultValues.topic.shared}
            color="primary"
          />
        </div>

        {Boolean(Object.entries(uploadProviders).length) && (
          <>
            <FormLabel>動画の指定方法</FormLabel>
            <RadioGroup
              defaultValue="url"
              row
              onChange={(event, value) => setMethod(value)}
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

        {method == "url" && (
          <>
            <Autocomplete
              id="resource.url"
              freeSolo
              options={[...Object.values(providers)].map(
                ({ baseUrl }) => baseUrl
              )}
              defaultValue={topic?.resource.url}
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
                  required
                  fullWidth
                  onChange={handleResourceUrlChange}
                />
              )}
            />
            {videoResource && (
              <>
                <VideoResource
                  {...videoResource}
                  autoplay={true}
                  onDurationChange={handleDurationChange}
                />
                <Button
                  className={classes.videoButtons}
                  variant="outlined"
                  color="primary"
                  onClick={handleSetStartTime}
                >
                  開始位置に設定
                </Button>
                <Button
                  className={classes.videoButtons}
                  variant="outlined"
                  color="primary"
                  onClick={handleSetStopTime}
                >
                  終了位置に設定
                </Button>
                <Button
                  className={classes.videoButtons}
                  variant="outlined"
                  color="primary"
                  onClick={handlePreview}
                >
                  プレビュー
                </Button>
              </>
            )}
          </>
        )}

        {method == "file" && (
          <>
            <TextField
              label="動画ファイル"
              type="file"
              required
              inputProps={register("fileContent")}
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
              <>
                <video
                  ref={localVideo}
                  className={classes.localVideo}
                  src={dataUrl}
                  controls={true}
                  autoPlay
                  onDurationChange={(event) => {
                    const video = event.target as HTMLVideoElement;
                    handleDurationChange(video.duration);
                  }}
                />
                <Button
                  className={classes.videoButtons}
                  variant="outlined"
                  color="primary"
                  onClick={handleSetStartTime}
                >
                  開始位置に設定
                </Button>
                <Button
                  className={classes.videoButtons}
                  variant="outlined"
                  color="primary"
                  onClick={handleSetStopTime}
                >
                  終了位置に設定
                </Button>
                <Button
                  className={classes.videoButtons}
                  variant="outlined"
                  color="primary"
                  onClick={handlePreview}
                >
                  プレビュー
                </Button>
              </>
            )}
          </>
        )}

        <TextField
          label="教材の主要な言語"
          select
          defaultValue={defaultValues.topic.language}
          inputProps={register("topic.language")}
        >
          {Object.entries(languages).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="学習時間 (秒)"
          type="number"
          inputProps={{
            ...register("topic.timeRequired", { valueAsNumber: true }),
            required: true,
            min: 1,
          }}
        />
        <TextField
          label="再生開始位置 (秒)"
          type="number"
          inputProps={{
            ...register("topic.startTime", { valueAsNumber: true }),
            step: 0.001,
            min: 0,
          }}
          error={startTimeError}
          onChange={handleStartTimeStopTimeChange}
        />
        <TextField
          label="再生終了位置 (秒)"
          type="number"
          inputProps={{
            ...register("topic.stopTime", { valueAsNumber: true }),
            step: 0.001,
            min: 0.001,
          }}
          error={stopTimeError}
          onChange={handleStartTimeStopTimeChange}
        />
        <TextField
          label="ライセンス"
          select
          defaultValue={defaultValues.topic.license}
          inputProps={{ displayEmpty: true, ...register("topic.license") }}
        >
          <MenuItem value="">未設定</MenuItem>
          {Object.entries(licenses).map(([value, { name }]) => (
            <MenuItem key={value} value={value}>
              {name}
            </MenuItem>
          ))}
        </TextField>
        <KeywordsInput {...keywordsInputProps} />
        <div>
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
        <TextField
          label="解説"
          fullWidth
          multiline
          inputProps={register("topic.description")}
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
