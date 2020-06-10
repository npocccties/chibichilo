import React from "react";
import { useContentsIndex } from "components/contents";
import { ContentsTable } from "components/ContentsTable";
import { ShowContents } from "components/ShowContents";
import { EditContents } from "components/EditContents";
import { NewContents } from "components/NewContents";
import { useRouter } from "components/router";
import { useAppTitle } from "components/state";
import { useContents } from "components/contents";
import { useVideos, useVideo } from "components/video";
import {
  useLmsSession,
  useLmsInstructor,
  isLmsInstructor,
} from "components/session";
import { PreviewContentsDialog } from "components/contents/PreviewContentsDialog";
import { PreviewDialog } from "components/video/PreviewDialog";

type Query = { id?: string; action?: "edit" | "new"; preview?: string };

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
  const setTitle = useAppTitle();
  if (isLmsInstructor(session)) {
    setTitle("学習コンテンツ管理");
  } else {
    setTitle(contents.title || "学習コンテンツ");
  }
  return <ShowContents contents={contents} />;
}
function Edit(props: { id: string; preview?: string }) {
  useLmsInstructor();
  const contents = useContents(Number(props.id));
  const videos = useVideos();
  const previewVideo = useVideo(Number(props.preview));
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
        open={Boolean(props.preview) && props.preview !== "all"}
        onClose={closePreviewHandler}
        video={previewVideo}
      />
    </div>
  );
}
function New(props: { preview?: string }) {
  useLmsInstructor();
  const contents = useContents();
  const videos = useVideos();
  const previewVideo = useVideo(Number(props.preview));
  const router = useRouter();
  const closePreviewHandler = React.useCallback(() => {
    router.push({
      pathname: "/contents",
      query: {
        action: router.query.action,
      },
    });
  }, [router]);
  return (
    <div>
      <NewContents contents={contents} videos={videos} />
      <PreviewDialog
        open={Boolean(props.preview) && props.preview !== "all"}
        onClose={closePreviewHandler}
        video={previewVideo}
      />
    </div>
  );
}

function Router() {
  const router = useRouter();
  const query: Query = router.query;

  useAppTitle()("学習コンテンツ管理");

  if (!query.id) {
    switch (query.action) {
      default:
        return <Index preview={query.preview} />;
      case "new":
        return <New preview={query.preview} />;
    }
  }

  switch (query.action) {
    default:
      return <Show id={query.id} />;
    case "edit":
      return <Edit id={query.id} preview={query.preview} />;
  }
}

export default Router;
