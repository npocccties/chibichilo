import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { useRouter } from "./router";
import { Table } from "./Table";
import { MouseEvent, useCallback } from "react";
import { Column } from "material-table";
import { Videos, destroyVideo } from "./video";
import { useSnackbar } from "material-ui-snackbar-provider";
import { SessionResponse } from "./api";
import { useLmsInstructor } from "./session";

type VideosRow = {
  id: number;
  title: string;
  description: string;
  creator: string;
};

function editable(row: VideosRow, session?: SessionResponse) {
  return (
    session && (session.role === "administrator" || row.creator === session.id)
  );
}

export function VideosTable(props: Videos) {
  const session = useLmsInstructor();
  const router = useRouter();
  const newHandler = useCallback(() => {
    router.push({
      pathname: "/videos",
      query: {
        action: "new",
      },
    });
  }, [router]);
  const editHandler = useCallback(
    (event?: MouseEvent, row?: VideosRow | VideosRow[]) => {
      const video = Array.isArray(row) ? row[0] : row;
      if (video == null) return;
      router.push({
        pathname: "/videos",
        query: { id: video.id, action: "edit" },
      });
      event?.preventDefault();
    },
    [router]
  );
  const { showMessage } = useSnackbar();
  const destroyHandler = useCallback(
    async (event: MouseEvent, row: VideosRow | VideosRow[]) => {
      event.preventDefault();
      const contents = Array.isArray(row) ? row[0] : row;
      const res = confirm(`「${contents.title}」を削除しますか？`);
      if (!res) return;
      await destroyVideo(contents.id);
      showMessage(`「${contents.title}」を削除しました`);
    },
    [showMessage]
  );
  const previewHandler = useCallback(
    (_: any, row?: VideosRow) => {
      router.push({
        pathname: "/videos",
        query: {
          preview: row?.id,
        },
      });
    },
    [router]
  );

  const editAction = useCallback(
    (row: VideosRow) => {
      const disabled = !editable(row, session);
      return {
        tooltip: disabled ? "権限がありません" : "編集する",
        icon: EditIcon,
        disabled,
        onClick: editHandler,
      };
    },
    [editHandler, session]
  );
  const destroyAction = useCallback(
    (row: VideosRow) => {
      const disabled = !editable(row, session);
      return {
        tooltip: disabled ? "権限がありません" : "削除する",
        icon: DeleteIcon,
        disabled,
        onClick: destroyHandler,
      };
    },
    [destroyHandler, session]
  );

  return (
    <Table
      title="ビデオ一覧"
      columns={[
        { title: "#", field: "id", width: "4rem" } as Column<VideosRow>,
        {
          title: "名称",
          field: "title",
          width: "20%",
        } as Column<VideosRow>,
        {
          title: "概要",
          field: "description",
          width: "auto",
        } as Column<VideosRow>,
      ]}
      actions={[
        editAction,
        destroyAction,
        {
          tooltip: "ビデオを追加する",
          icon: AddCircleIcon,
          onClick: newHandler,
          isFreeAction: true,
        },
      ]}
      options={{
        actionsColumnIndex: -1,
      }}
      onRowClick={previewHandler}
      data={props.videos}
    />
  );
}
