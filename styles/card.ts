import type { Theme } from "@mui/material/styles";
import gray from "theme/colors/gray";

const card = {
  border: `1px solid ${gray[400]}`,
  borderRadius: "12px",
  boxShadow: "none",
  padding: (theme: Theme) => theme.spacing(2, 3),
  maxWidth: "100%",
};

export default card;
