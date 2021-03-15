import { ChangeEvent, useCallback, useState } from "react";
import Card from "@material-ui/core/Card";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useForm, Controller } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import clsx from "clsx";
import TextField from "$atoms/TextField";
import SubtitleChip from "$atoms/SubtitleChip";
import SubtitleUploadDialog from "$organisms/SubtitleUploadDialog";
import Video from "$organisms/Video";
import useCardStyles from "styles/card";
import useInputLabelStyles from "styles/inputLabel";
import gray from "theme/colors/gray";
import type { TopicProps, TopicSchema } from "$server/models/topic";
import type {
  VideoTrackProps,
  VideoTrackSchema,
} from "$server/models/videoTrack";
import languages from "$utils/languages";
import providers from "$utils/providers";
import useVideoResourceProps from "$utils/useVideoResourceProps";
import { useVideoTrackAtom } from "$store/videoTrack";

const useStyles = makeStyles((theme) => ({
  margin: {
    "& > :not(:last-child)": {
      marginBottom: theme.spacing(2.5),
    },
  },
  labelDescription: {
    marginLeft: theme.spacing(0.75),
    color: gray[600],
  },
  subtitles: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    "& > *": {
      marginRight: theme.spacing(1.75),
      marginBottom: theme.spacing(1),
    },
  },
}));

type Props = {
  topic?: TopicSchema;
  className?: string;
  submitLabel?: string;
  onSubmit?(topic: TopicProps): void;
  onSubtitleSubmit(videoTrack: VideoTrackProps): void;
  onSubtitleDelete(videoTrack: VideoTrackSchema): void;
};

export default function TopicForm(props: Props) {
  const {
    topic,
    className,
    submitLabel = "更新",
    onSubmit = () => undefined,
    onSubtitleSubmit,
    onSubtitleDelete,
  } = props;
  const cardClasses = useCardStyles();
  const inputLabelClasses = useInputLabelStyles();
  const classes = useStyles();
  const { videoResource, setUrl } = useVideoResourceProps(topic?.resource);
  const handleResourceUrlChange = useDebouncedCallback(
    (event: ChangeEvent<HTMLInputElement>) => setUrl(event.target.value),
    500
  ).callback;
  const { videoTracks } = useVideoTrackAtom();
  const [open, setOpen] = useState(false);
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
  const defaultValues = {
    name: topic?.name,
    description: topic?.description ?? "",
    shared: Boolean(topic?.shared),
    language: topic?.language ?? Object.getOwnPropertyNames(languages)[0],
    timeRequired: topic?.timeRequired,
  };
  const { handleSubmit, register, control, getValues, setValue } = useForm<
    Omit<TopicProps, "resource">
  >({
    defaultValues,
  });
  const handleDurationChange = useCallback(
    (duration: number) => {
      const { timeRequired } = getValues();
      if (timeRequired > 0) return;
      setValue("timeRequired", Math.floor(duration));
    },
    [getValues, setValue]
  );

  return (
    <>
      <Card
        classes={cardClasses}
        className={clsx(classes.margin, className)}
        component="form"
        onSubmit={handleSubmit((values) => {
          onSubmit({
            ...defaultValues,
            ...values,
            resource: videoResource ?? { url: "" },
          });
        })}
      >
        <TextField
          name="name"
          inputRef={register}
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
          defaultValue={defaultValues.name}
          required
          fullWidth
        />
        <div>
          <InputLabel classes={inputLabelClasses} htmlFor="shared">
            他の編集者にシェア
          </InputLabel>
          <Checkbox
            id="shared"
            name="shared"
            inputRef={register}
            defaultChecked={defaultValues.shared}
            color="primary"
          />
        </div>
        <Autocomplete
          id="resource.url"
          freeSolo
          options={[...Object.values(providers)].map(({ baseUrl }) => baseUrl)}
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
          <Video {...videoResource} onDurationChange={handleDurationChange} />
        )}
        <Controller
          name="language"
          control={control}
          defaultValue={defaultValues.language}
          render={(props) => (
            <TextField label="教材の主要な言語" select inputProps={props}>
              {Object.entries(languages).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <TextField
          name="timeRequired"
          label="学習時間 (秒)"
          type="number"
          inputProps={{
            ref: register({
              setValueAs: (value) => (value === "" ? null : +value),
              min: 0,
            }),
            min: 0,
          }}
        />
        <div>
          <InputLabel classes={inputLabelClasses}>字幕</InputLabel>
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
          name="description"
          inputRef={register}
        />
        <Button variant="contained" color="primary" type="submit">
          {submitLabel}
        </Button>
      </Card>

      <SubtitleUploadDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubtitleSubmit}
      />
    </>
  );
}
