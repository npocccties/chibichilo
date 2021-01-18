export default { title: "atoms/AppBarNavButton" };

import { MenuBookOutlined } from "@material-ui/icons";
import AppBarNavButton from "./AppBarNavButton";

export const Default = () => (
  <AppBarNavButton icon={<MenuBookOutlined />} label="マイブック" />
);
