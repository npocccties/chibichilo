export default { title: "atoms/AppBarNavButton" };

import MenuBookOutlinedIcon from "@material-ui/icons/MenuBookOutlined";
import AppBarNavButton from "./AppBarNavButton";

export const Default = () => (
  <AppBarNavButton icon={<MenuBookOutlinedIcon />} label="ブック" />
);
