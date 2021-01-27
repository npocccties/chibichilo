import { SetStateAction, useState } from "react";

function useDialogProps<T>() {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState<T>();
  const onClose = () => {
    setOpen(false);
  };
  const dispatch = (state: SetStateAction<T | undefined>) => {
    setOpen(true);
    setData(state);
  };
  return {
    data,
    open: data != null && open,
    onClose,
    dispatch,
  };
}

export default useDialogProps;
