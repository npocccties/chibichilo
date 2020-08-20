import ArrowDownward from "@material-ui/icons/ArrowDownward";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Search from "@material-ui/icons/Search";
import MaterialTable, { Column, MaterialTableProps } from "material-table";

// function withIndex<T>(data: T[]) {
//   return data.map((e, index) => ({ ...e, index: index + 1 /* one-based */ }));
// }

export function Table<T extends object>(
  props: MaterialTableProps<T> & { data: T[] }
) {
  return (
    <MaterialTable
      {...props}
      columns={
        props.columns.map((c) => ({
          ...c,
          headerStyle: { padding: 0 },
          cellStyle: {
            padding: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        })) as Column<T>[]
      }
      localization={{
        header: {
          actions: "",
        },
        toolbar: {
          nRowsSelected: "{0}個選択されました",
        },
      }}
      components={{
        Container: (props) => <div {...props} />,
        ...props.components,
      }}
      data={props.data}
      options={{
        sorting: true,
        tableLayout: "fixed",
        rowStyle: { height: 49 },
        pageSize: 10,
        pageSizeOptions: ((opts, rows) => {
          const i = opts.findIndex((n) => rows <= n);
          return opts.slice(0, i >= 0 ? i + 1 : opts.length);
        })([10, 50, 100], props.data.length),
        actionsCellStyle: { padding: 0 },
        ...props.options,
      }}
      icons={
        {
          Clear,
          FirstPage,
          LastPage,
          NextPage: ChevronRight,
          PreviousPage: ChevronLeft,
          ResetSearch: Clear,
          Search,
          SortArrow: ArrowDownward,
        } as any
      }
    />
  );
}
