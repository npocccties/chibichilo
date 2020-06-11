import { useCallback, useRef, useEffect } from "react";
import { Column } from "material-table";
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck";
import { useRouter } from "../router";
import { Table } from "../Table";

export type VideosRow = {
  id: number;
  title: string;
  description: string;
};

export type VideosSelector = typeof VideosSelectorTable;

export function VideosSelectorTable(props: {
  rows: VideosRow[];
  onSelect: (row: VideosRow[]) => void;
}) {
  const tableRef = useRef<HTMLTableElement>(document.createElement("table"));
  useEffect(() => {
    // NOTE: Uncheck All
    // @ts-ignore
    tableRef.current.onAllSelected(false);
  }, [tableRef]);
  const onSelect = useCallback(
    (_: any, rows: VideosRow | VideosRow[]) => {
      props.onSelect(Array.isArray(rows) ? rows : [rows]);
    },
    [props.onSelect]
  );
  const router = useRouter();
  const previewHandler = useCallback(
    (_: any, row?: VideosRow) => {
      router.push({
        pathname: "/contents",
        query: {
          id: router.query.id,
          action: router.query.action,
          preview: row?.id,
        },
      });
    },
    [router]
  );

  return (
    <Table
      tableRef={tableRef}
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
        {
          tooltip: "選択されたビデオを追加します",
          icon: PlaylistAddCheckIcon,
          onClick: onSelect,
        },
      ]}
      options={{
        selection: true,
      }}
      onRowClick={previewHandler}
      data={props.rows}
    />
  );
}
