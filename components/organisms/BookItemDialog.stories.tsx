export default { title: "organisms/BookItemDialog" };

import Button from "@material-ui/core/Button";
import type { BookSchema } from "$server/models/book";
import useDialogProps from "$utils/useDialogProps";
import BookItemDialog from "./BookItemDialog";
import { book } from "$samples";

export const Default = () => {
  const { data, dispatch, ...dialogProps } = useDialogProps<BookSchema>();
  const handleClick = () => dispatch(book);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClick}>
        ダイアログ
      </Button>
      {data && <BookItemDialog {...dialogProps} book={data} />}
    </>
  );
};
