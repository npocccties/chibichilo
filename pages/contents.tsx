import React from "react";
import { useContentsIndex } from "components/contents";
import { ContentsTable } from "components/ContentsTable";
import { ShowContents } from "components/ShowContents";
import { EditContents } from "components/EditContents";
import { useRouter } from "components/router";
import { useAppTitle } from "components/state";
import { useContents } from "components/contents";
import { useVideos, useVideo } from "components/video";
import {
  useLmsSession,
  useLmsInstructor,
  isLmsInstructor,
} from "components/session";
import { EditVideoDialog } from "components/contents/EditVideoDialog";
import { PreviewContentsDialog } from "components/contents/PreviewContentsDialog";
import { PreviewDialog } from "components/video/PreviewDialog";

type Query = {
  id?: string;
  action?: "edit" | "new";
  preview?: string;
  video?: string;
};

function Index(props: { preview?: string }) {
  useLmsInstructor();
  const contentsIndex = useContentsIndex();
  const previewContents = useContents(Number(props.preview));
  const router = useRouter();
  const closePreviewHandler = React.useCallback(() => {
    router.push("/contents");
  }, [router]);

  switch (contentsIndex.state) {
    case "failure":
      return <div>failed to load</div>;
    case "pending":
      return <div>loading...</div>;
  }

  return (
    <div>
      <ContentsTable {...contentsIndex} />
      <PreviewContentsDialog
        open={Boolean(props.preview)}
        onClose={closePreviewHandler}
        contents={previewContents}
      />
    </div>
  );
}

function Show(props: { id: string }) {
  const session = useLmsSession();
  const contents = useContents(Number(props.id));
  const appTitle = useAppTitle();
  if (!isLmsInstructor(session) && contents.title) {
    appTitle(contents.title);
  }
  return <ShowContents contents={contents} />;
}
function Edit(props: { id?: string; preview?: string; video?: string }) {
  useLmsInstructor();
  const contents = useContents(Number(props.id));
  const videos = useVideos();
  const editOrPreviewVideo = useVideo(
    Number(props.video) || Number(props.preview)
  );
  const router = useRouter();
  const closePreviewHandler = React.useCallback(() => {
    router.push({
      pathname: "/contents",
      query: {
        id: router.query.id,
        action: router.query.action,
      },
    });
  }, [router]);

  return (
    <div>
      <EditContents contents={contents} videos={videos} />
      <PreviewDialog
        open={
          !Boolean(props.video) &&
          Boolean(props.preview) &&
          props.preview !== "all"
        }
        onClose={closePreviewHandler}
        video={editOrPreviewVideo}
      />
      <EditVideoDialog
        open={Boolean(props.video)}
        onClose={closePreviewHandler}
        video={editOrPreviewVideo}
      />
    </div>
  );
}
const New = Edit;

function Router() {
  const router = useRouter();
  const query: Query = router.query;
  const appTitle = useAppTitle();
  appTitle("学習コンテンツ管理");

  if (!query.id) {
    switch (query.action) {
      default:
        return <Index preview={query.preview} />;
      case "new": {
        appTitle("学習コンテンツの作成");
        return <New preview={query.preview} video={query.video} />;
      }
    }
  }

  switch (query.action) {
    default:
      return <Show id={query.id} />;
    case "edit":
      return <Edit id={query.id} preview={query.preview} video={query.video} />;
  }
}

export default Router;
