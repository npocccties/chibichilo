import React from "react";
import { useContentsIndex, useContents } from "components/contents";
import { useAppTitle } from "components/state";
import { useLmsInstructor } from "components/session";
import { ContentsSelectorTable } from "components/ContentsTable";
import Alert from "@material-ui/lab/Alert";
import LinkIcon from "@material-ui/icons/Link";
import { PreviewContentsDialog } from "components/contents/PreviewContentsDialog";
import { useRouter } from "components/router";

function Edit() {
  useLmsInstructor();
  const contentsIndex = useContentsIndex();
  const router = useRouter();
  const closePreviewHandler = React.useCallback(() => {
    router.push("/edit");
  }, [router]);
  const previewContents = useContents(Number(router.query.preview));
  useAppTitle()("LMS 連携");
  switch (contentsIndex.state) {
    case "failure":
      return <div>failed to load</div>;
    case "pending":
      return <div>loading...</div>;
  }
  return (
    <div>
      <Alert severity="info">
        選択したコンテンツを LMS (学習管理システム)
        に紐付けます。紐付ける学習コンテンツの右のリンクアイコン{" "}
        <LinkIcon style={{ verticalAlign: "middle" }} />{" "}
        をクリックしてください。
      </Alert>
      <ContentsSelectorTable {...contentsIndex} />
      <PreviewContentsDialog
        open={Boolean(previewContents.id)}
        onClose={closePreviewHandler}
        contents={previewContents}
      />
    </div>
  );
}

export default Edit;
