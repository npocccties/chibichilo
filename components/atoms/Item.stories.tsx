export default { title: "atoms/Item" };

import Item from "./Item";
import Box from "@mui/material/Box";

export const Default = () => {
  return (
    <Box sx={{ "& > :not(:last-child)": { mr: 1.75 } }}>
      <Item itemKey="作成日" value="2020.11.19" />
      <Item itemKey="更新日" value="2020.11.19" />
      <Item itemKey="著者" value="山田太郎" />
    </Box>
  );
};
