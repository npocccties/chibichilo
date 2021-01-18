export default { title: "organisms/LtiItemDialog" };

import { useState } from "react";
import Button from "@material-ui/core/Button";
import LtiItemDialog from "./LtiItemDialog";
import { session } from "$samples";

export const Default = () => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClick}>
        ダイアログ
      </Button>
      <LtiItemDialog open={open} onClose={handleClose} session={session} />
    </>
  );
};
