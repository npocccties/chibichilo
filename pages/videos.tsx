import React from "react";
import { useVideos, useVideo } from "components/video";
import { PreviewDialog } from "components/video/PreviewDialog";
import { useAppTitle } from "components/state";
import { useRouter } from "components/router";
import { useLmsInstructor } from "components/session";
import { VideosTable } from "components/VideosTable";
import { ShowVideo } from "components/ShowVideo";
import { EditVideo } from "components/EditVideo";

type Query = { id?: string; action?: "edit" | "new"; preview?: string };

function Index(props: { preview?: string }) {
  const videos = useVideos();
  const previewVideo = useVideo(Number(props.preview));
  const router = useRouter();
  const closePreviewHandler = React.useCallback(() => {
    router.push("/videos");
  }, [router]);

  switch (videos.state) {
    case "failure":
      return <div>failed to load</div>;
    case "pending":
      return <div>loading...</div>;
  }

  return (
    <div>
      <VideosTable {...videos} />
      <PreviewDialog
        open={Boolean(props.preview)}
        onClose={closePreviewHandler}
        video={previewVideo}
      />
    </div>
  );
}

function Show(props: { id: string }) {
  const video = useVideo(Number(props.id));
  return <ShowVideo {...video} />;
}
function Edit(props: { id?: string }) {
  const video = useVideo(Number(props.id));
  return <EditVideo video={video} />;
}
const New = Edit;

function Router() {
  useLmsInstructor();
  const router = useRouter();
  const query: Query = router.query;
  const appTitle = useAppTitle();
  appTitle("ビデオ管理");

  if (!query.id) {
    switch (query.action) {
      default:
        return <Index preview={query.preview} />;
      case "new": {
        appTitle("ビデオの登録");
        return <New />;
      }
    }
  }

  switch (query.action) {
    default:
      return <Show id={query.id} />;
    case "edit":
      return <Edit id={query.id} />;
  }
}

export default Router;
