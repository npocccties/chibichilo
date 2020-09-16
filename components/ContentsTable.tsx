import { MouseEvent, useCallback } from "react";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import LibraryAdd from "@material-ui/icons/LibraryAdd";
import LinkIcon from "@material-ui/icons/Link";
import { Column } from "material-table";
import { useConfirm } from "material-ui-confirm";
import { useSnackbar } from "material-ui-snackbar-provider";
import { registContents } from "./api";
import { useRouter } from "./router";
import { Table } from "./Table";
import { destroyContents } from "./contents";
import { useLmsInstructor } from "./session";

type ContentsRow = {
  id: number;
  title: string;
  creator: string;
};

function editable(row: ContentsRow, session?: Session) {
  return (
    session && (session.role === "administrator" || row.creator === session.id)
  );
}

export function ContentsTable(props: ContentsIndex) {
  const session = useLmsInstructor();
  const router = useRouter();
  const newHandler = useCallback(() => {
    router.push({
      pathname: "/contents",
      query: {
        action: "new",
      },
    });
  }, [router]);
  const editHandler = useCallback(
    (event: MouseEvent, row: ContentsRow | ContentsRow[]) => {
      event.preventDefault();
      if (!row) return;
      if (Array.isArray(row)) return;
      router.push({
        pathname: "/contents",
        query: { id: row.id, action: "edit" },
      });
    },
    [router]
  );
  const confirm = useConfirm();
  const { showMessage } = useSnackbar();
  const destroyHandler = useCallback(
    async (event: MouseEvent, row: ContentsRow | ContentsRow[]) => {
      event.preventDefault();
      const contents = Array.isArray(row) ? row[0] : row;
      try {
        await confirm({
          title: `「${contents.title}」を削除しますか？`,
          cancellationText: "キャンセル",
          confirmationText: "OK",
        });
        await destroyContents(contents.id);
        showMessage(`「${contents.title}」を削除しました`);
      } catch {}
    },
    [showMessage, confirm]
  );
  const previewHandler = useCallback(
    (_: any, row?: ContentsRow) => {
      router.push({
        pathname: "/contents",
        query: {
          preview: row?.id,
        },
      });
    },
    [router]
  );

  const editAction = useCallback(
    (row: ContentsRow) => {
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
    (row: ContentsRow) => {
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

  const data = props.contents;

  return (
    <Table
      title="学習コンテンツ一覧"
      columns={[
        { title: "#", field: "id", width: "4rem" } as Column<ContentsRow>,
        {
          title: "名称",
          field: "title",
          width: "auto",
        } as Column<ContentsRow>,
      ]}
      actions={[
        editAction,
        destroyAction,
        {
          icon: LibraryAdd,
          tooltip: "学習コンテンツを作成する",
          isFreeAction: true,
          onClick: newHandler,
        },
      ]}
      options={{
        actionsColumnIndex: -1,
      }}
      onRowClick={previewHandler}
      data={data}
    />
  );
}

export function ContentsSelectorTable(props: ContentsIndex) {
  const router = useRouter();
  const showHandler = useCallback(
    async (event?: MouseEvent, row?: ContentsRow | ContentsRow[]) => {
      const contents = Array.isArray(row) ? row[0] : row;
      if (contents == null) return;
      await registContents(contents.id, contents.title);
      router.push({
        pathname: "/contents",
        query: {
          id: contents.id,
          action: "show",
        },
      });
      event?.preventDefault();
    },
    [router]
  );
  const previewHandler = useCallback(
    (_: any, row?: ContentsRow) => {
      router.push({
        pathname: "/edit",
        query: {
          preview: row?.id,
        },
      });
    },
    [router]
  );

  const session = useLmsInstructor();
  const linkAction = useCallback(
    (row: ContentsRow) => {
      const linked = row.id === session?.contents;
      return {
        icon: LinkIcon,
        tooltip: linked
          ? "すでに学習管理システムに紐付いています"
          : "学習管理システムに紐付ける",
        onClick: showHandler,
        disabled: linked,
      };
    },
    [router, showHandler, session]
  );

  const linked = props.contents.find(({ id }) => id === session?.contents);
  const data = [
    ...(linked
      ? [
          {
            ...linked,
            title: `${linked.title} (現在、学習管理システムに紐付いています)`,
          },
        ]
      : []),
    ...props.contents.filter(({ id }) => id !== linked?.id),
  ];
  return (
    <Table
      title="学習コンテンツ一覧"
      columns={[
        {
          title: "#",
          field: "id",
          width: "4rem",
        } as Column<ContentsRow>,
        {
          title: "名称",
          field: "title",
          width: "auto",
        } as Column<ContentsRow>,
      ]}
      actions={[linkAction]}
      options={{
        actionsColumnIndex: -1,
      }}
      onRowClick={previewHandler}
      data={data}
    />
  );
}
