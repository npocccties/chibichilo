import { useEffect, useState, useCallback, FormEvent } from "react";
import { useSnackbar } from "material-ui-snackbar-provider";
import { produce } from "immer";
import ISO6391 from "iso-639-1";
import { Player } from "./Player";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import CloseIcon from "@material-ui/icons/Close";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Subtitle, destroySubtitle } from "./video/subtitle";
import { useRouter } from "./router";
import { Video, updateVideo, createVideo } from "./video";
import { validUrl } from "./validUrl";

const iso6391 = ISO6391.getLanguages(ISO6391.getAllCodes());
const parseVideoId = (youtubeUrlOrVideoId: string) => {
  if (!validUrl(youtubeUrlOrVideoId)) return youtubeUrlOrVideoId;
  return (
    new URL(youtubeUrlOrVideoId).searchParams.get("v") ?? youtubeUrlOrVideoId
  );
};

export function EditVideo(props: { video: Video }) {
  const router = useRouter();
  const saveHandler = useCallback(
    (id: number) => {
      router.replace({
        pathname: "/videos",
        query: {
          id,
          action: "edit",
        },
      });
      router.push("/videos");
    },
    [router]
  );
  const cancelHandler = useCallback(() => {
    router.push("/videos");
  }, [router]);

  return (
    <EditVideoForm
      video={props.video}
      onSave={saveHandler}
      onCancel={cancelHandler}
      saveActionLabel="保存してビデオ一覧に戻る"
      cancelActionLabel="保存せずビデオ一覧に戻る"
    />
  );
}

export function EditVideoForm(props: {
  video: Video;
  onSave: (id: number) => void;
  onCancel: () => void;
  saveActionLabel: string;
  cancelActionLabel: string;
}) {
  const [video, setVideo] = useState<Video>(props.video);
  useEffect(() => {
    if (props.video.state === "success") setVideo(props.video);
  }, [props.video]);
  const { showMessage } = useSnackbar();
  const saveHandler = useCallback(async () => {
    let id = video.id;
    if (id) {
      await updateVideo(video as Required<Video>);
    } else {
      id = await createVideo(video);
    }
    if (!id) return;
    if (typeof window !== "undefined") {
      window.onbeforeunload = null;
    }
    showMessage(`保存しました`);
    props.onSave(id);
  }, [video, showMessage, props.onSave]);
  const cancelHandler = useCallback(() => {
    if (typeof window !== "undefined") {
      window.onbeforeunload = null;
    }
    props.onCancel();
  }, [props.onCancel]);

  const edit = useCallback(
    (dispatch: (v: Video) => Video) => {
      setVideo(dispatch({ ...video, state: "pending" }));
      if (typeof window === "undefined") return;
      window.onbeforeunload = function (e: BeforeUnloadEvent) {
        // NOTE: 作成(new)・編集(edit)画面での離脱防止
        const action = new URL(document.location.href).searchParams.get(
          "action"
        );
        if (action && ["new", "edit"].includes(action)) e.returnValue = "";
      };
    },
    [video, setVideo]
  );
  const onInputHandler = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      const form = new FormData(event.currentTarget);
      edit((video) =>
        produce(video, (draft) => {
          draft.title = form.get("title") as string;
          draft.description = form.get("description") as string;
          const youtubeUrlOrVideoId = form.get("youtubeVideoId") as string;
          draft.youtubeVideoId = parseVideoId(youtubeUrlOrVideoId);
          draft.skills = draft.skills.map(({ id, name }) => ({
            id,
            name,
            has: Boolean(form.get(`skill-${id}`)),
          }));
          draft.tasks = draft.tasks.map(({ id, name }) => ({
            id,
            name,
            has: Boolean(form.get(`task-${id}`)),
          }));
          draft.levels = draft.levels.map(({ id, name }) => ({
            id,
            name,
            has: Boolean(form.get(`level-${id}`)),
          }));
          const uploadSubtitleLang = form.get("upload-subtitle-lang") as string;
          const uploadSubtitleFile = form.get("upload-subtitle-file") as
            | File
            | undefined;
          if (uploadSubtitleFile && uploadSubtitleLang !== "und") {
            draft.subtitles.push({
              lang: uploadSubtitleLang,
              file: uploadSubtitleFile,
            });
            const subtitles: Map<
              Subtitle["id"],
              {
                lang: string;
                file: File;
              }
            > = draft.subtitles.reduce(
              (prev, { id, lang, file }) => prev.set(id, { lang, file }),
              new Map()
            );
            draft.subtitles = [];
            Array.from(subtitles).forEach(([id, sub]) =>
              draft.subtitles.push({ id, ...sub })
            );
          }
        })
      );
    },
    [edit]
  );
  const submitHandler = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      saveHandler();
    },
    [saveHandler]
  );

  const [subtitleLang, setSubtitleLang] = useState<string>("und");
  const changesubtitleLangHandler = useCallback(
    (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const lang = event.currentTarget.value;
      if (lang !== "und") setSubtitleLang(lang);
    },
    [setSubtitleLang]
  );
  const destroySubtitleHandler = useCallback(
    (lang: string, id?: number) => async (_: MouseEvent) => {
      if (!id) return;
      // TODO: confirm やめたい
      if (!confirm(`字幕「${lang}」を削除します。よろしいですか？`)) return;
      try {
        await destroySubtitle(id);
        const videoDispatch = (video: Video) =>
          produce(video, (draft) => {
            draft.subtitles = draft.subtitles.filter((sub) => sub.id !== id);
          });
        edit(videoDispatch);
      } catch {}
    },
    [edit]
  );

  return (
    <form onInput={onInputHandler} onSubmit={submitHandler}>
      <Box my={2}>
        <TextField
          name="title"
          label="タイトル"
          value={video.title}
          required
          fullWidth
          color="secondary"
        />
      </Box>
      <Box my={2}>
        <Box my={1}>
          <Player
            youtubeVideoId={video.youtubeVideoId}
            subtitles={video.subtitles}
          />
        </Box>
        <TextField
          name="youtubeVideoId"
          label="YouTube 動画の URL またはビデオ ID"
          value={video.youtubeVideoId}
          variant="filled"
          required
          fullWidth
          color="secondary"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                https://www.youtube.com/watch?v=
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TextField
        name="description"
        label="概要"
        value={video.description}
        variant="outlined"
        multiline
        rows={5}
        fullWidth
        color="secondary"
      />
      <Box my={2}>
        <Box m={1}>
          <FormControl component="fieldset" color="secondary">
            <FormLabel component="legend">スキル</FormLabel>
            <FormGroup row>
              {video.skills.map(({ id, name, has }) => (
                <FormControlLabel
                  key={id}
                  control={
                    <Checkbox
                      name={`skill-${id}`}
                      value
                      // FIXME: Use a controlled
                      defaultChecked={has}
                    />
                  }
                  label={name}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Box>
        <Box m={1}>
          <FormControl component="fieldset" color="secondary">
            <FormLabel component="legend">職種</FormLabel>
            <FormGroup row>
              {video.tasks.map(({ id, name, has }) => (
                <FormControlLabel
                  key={id}
                  control={
                    <Checkbox
                      name={`task-${id}`}
                      value
                      // FIXME: Use a controlled
                      defaultChecked={has}
                    />
                  }
                  label={name}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Box>
        <Box m={1}>
          <FormControl component="fieldset" color="secondary">
            <FormLabel component="legend">レベル</FormLabel>
            <FormGroup row>
              {video.levels.map(({ id, name, has }) => (
                <FormControlLabel
                  key={id}
                  control={
                    <Checkbox
                      name={`level-${id}`}
                      value
                      // FIXME: Use a controlled
                      defaultChecked={has}
                    />
                  }
                  label={name}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Box>
        <Box my={2}>
          <Box m={1}>
            <Box my={1}>
              <Typography variant="subtitle1">字幕</Typography>
            </Box>
            {video.subtitles.map(
              ({ id, lang }) =>
                id && (
                  <Chip
                    key={id}
                    label={ISO6391.getNativeName(lang)}
                    onDelete={destroySubtitleHandler(
                      ISO6391.getNativeName(lang),
                      id
                    )}
                    style={{ margin: 8 }}
                  />
                )
            )}
          </Box>
          <Box my={1}>
            <TextField
              select
              label="追加する字幕の言語"
              name="upload-subtitle-lang"
              defaultValue="und"
              variant="filled"
              fullWidth
              color="secondary"
              onChange={changesubtitleLangHandler}
            >
              <MenuItem value="und">未選択</MenuItem>
              {iso6391.map(({ code, nativeName }) => (
                <MenuItem key={code} value={code}>
                  {nativeName}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          {subtitleLang !== "und" && (
            <input type="file" name="upload-subtitle-file" />
          )}
        </Box>
      </Box>
      <Box mt={2} mb={4} display="flex">
        <Button
          variant="contained"
          size="large"
          startIcon={<CloseIcon />}
          onClick={cancelHandler}
          fullWidth
          style={{ margin: 16 }}
        >
          {props.cancelActionLabel}
        </Button>
        <Button
          type="submit"
          name="submit"
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          fullWidth
          style={{ margin: 16 }}
        >
          {props.saveActionLabel}
        </Button>
      </Box>
    </form>
  );
}
