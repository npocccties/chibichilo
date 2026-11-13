import type { SxProps } from "@mui/system";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import { useSearchAtom } from "$store/search";

type Props = {
  className?: string;
  sx?: SxProps;
  totalCount: number;
};

function SearchPagination({ className = "", sx, totalCount }: Props) {
  const searchProps = useSearchAtom();
  const count = Math.ceil(totalCount / searchProps.query.perPage);

  if (!(count > 1)) return null;

  const page = searchProps.query.page + 1;
  return (
    <Box className={className} sx={sx} display="flex" justifyContent="center">
      <Pagination
        color="primary"
        page={page}
        count={count}
        onChange={(_, page) => searchProps.setPage(page - 1)}
      />
    </Box>
  );
}

export default SearchPagination;
