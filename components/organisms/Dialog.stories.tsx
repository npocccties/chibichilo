export default { title: "organisms/Dialog" };

import type { Ref } from "react";
import { forwardRef, useState } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import CloseIcon from "@mui/icons-material/Close";

const Transition = forwardRef(function Transition(
  props: TransitionProps & React.ComponentProps<typeof Slide>,
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const Default = () => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClick}>
        ダイアログ
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        slots={{
          transition: Transition,
        }}
      >
        <DialogContent>
          <IconButton
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogContent>
      </Dialog>
    </div>
  );
};
