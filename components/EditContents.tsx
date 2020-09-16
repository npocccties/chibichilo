import { useState, useCallback, FormEvent, useEffect } from "react";
import { reorder } from "./reorder";
import { produce } from "immer";
import { saveContents } from "./contents";
import { ReorderVideos } from "./ReorderVideos";
import { IconButton, Tooltip, Box, Button, TextField } from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import CloseIcon from "@material-ui/icons/Close";
import SaveIcon from "@material-ui/icons/Save";
import { useSnackbar } from "material-ui-snackbar-provider";
import { useRouter } from "./router";
import { AddVideosButton } from "./contents/AddVideosButton";
import { VideosRow } from "./contents/VideosSelectorTable";
import { PreviewContentsDialog } from "./contents/PreviewContentsDialog";

export function EditContents(props: { contents: Contents; videos: Videos }) {
  const [contents, setContents] = useState<Contents>(props.contents);
  useEffect(() => {
    if (props.contents.state === "success") setContents(props.contents);
  }, [props.contents]);
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const saveHandler = useCallback(async () => {
    const id = await saveContents(contents);
    if (!Number.isFinite(id)) return;
    if (typeof window !== "undefined") {
      window.onbeforeunload = null;
    }
    router.replace({
      pathname: "/contents",
      query: {
        id,
        action: "edit",
      },
    });
    router.push("/contents");
    showMessage(`保存しました`);
  }, [contents, showMessage, router]);
  const submitHandler = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      saveHandler();
    },
    [saveHandler]
  );
  const closeHandler = useCallback(() => {
    if (typeof window !== "undefined") {
      window.onbeforeunload = null;
    }
    router.push("/contents");
  }, [router]);
  const previewHandler = useCallback(() => {
    router.push({
      pathname: "/contents",
      query: {
        id: router.query.id,
        action: router.query.action,
        preview: "all",
      },
    });
  }, [router]);
  const closePreviewHandler = useCallback(() => {
    router.push({
      pathname: "/contents",
      query: {
        id: router.query.id,
        action: router.query.action,
      },
    });
  }, [router]);

  const editContents = useCallback(
    (dispatch: (c: Contents) => Contents) => {
      setContents(dispatch({ ...contents, state: "pending" }));
      if (typeof window !== "undefined") {
        window.onbeforeunload = function (e: BeforeUnloadEvent) {
          // NOTE: 作成(new)・編集(edit)画面での離脱防止
          const action = new URL(document.location.href).searchParams.get(
            "action"
          );
          if (action && ["new", "edit"].includes(action)) e.returnValue = "";
        };
      }
    },
    [contents, setContents]
  );
  const editTitle = useCallback(
    (title: string) => {
      editContents((contents) =>
        produce(contents, (draft) => {
          draft.title = title;
        })
      );
    },
    [editContents]
  );
  const editTitleHandler = useCallback(
    (event: FormEvent) =>
      editTitle((event.target as HTMLInputElement).value || ""),
    [editTitle]
  );

  const reorderVideo = useCallback(
    (source: number, destination: number) => {
      editContents((contents) =>
        produce(contents, (draft) => {
          draft.videos = reorder(draft.videos, source, destination);
        })
      );
    },
    [editContents]
  );
  const editVideoTitle = useCallback(
    (index: number, title: string) => {
      editContents((contents) =>
        produce(contents, (draft) => {
          draft.videos[index].title = title;
        })
      );
    },
    [editContents]
  );
  const deleteVideo = useCallback(
    (index: number) => {
      editContents((contents) =>
        produce(contents, (draft) => {
          draft.videos.splice(index, 1);
        })
      );
    },
    [editContents]
  );
  const addVideo = useCallback(
    (selected: VideosRow[]) => {
      editContents((contents) =>
        produce(contents, (draft) => {
          draft.videos = draft.videos.concat(selected);
        })
      );
    },
    [editContents]
  );

  return (
    <form onSubmit={submitHandler}>
      <Box my={2} display="flex">
        <Tooltip title="再生する">
          <IconButton
            area-label="play"
            style={{
              marginRight: 16,
            }}
            onClick={previewHandler}
          >
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
        <TextField
          name="title"
          label="タイトル"
          value={contents.title}
          required
          fullWidth
          onInput={editTitleHandler}
          color="secondary"
          style={{
            marginBottom: 8,
          }}
        />
      </Box>
      <ReorderVideos
        videos={contents.videos}
        onVideoDragEnd={reorderVideo}
        onEditVideoTitle={editVideoTitle}
        onDeleteVideo={deleteVideo}
      />
      <Box mt={2} mb={4} textAlign="center">
        <AddVideosButton
          videos={props.videos}
          onOpen={() => {}}
          onClose={addVideo}
        />
      </Box>
      <Box mt={2} mb={4} display="flex">
        <Button
          variant="contained"
          size="large"
          startIcon={<CloseIcon />}
          onClick={closeHandler}
          fullWidth
          style={{ margin: 16 }}
        >
          保存せず学習コンテンツ一覧に戻る
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
          保存して学習コンテンツ一覧に戻る
        </Button>
      </Box>
      <PreviewContentsDialog
        open={router.query.preview === "all"}
        onClose={closePreviewHandler}
        contents={contents}
      />
    </form>
  );
}
