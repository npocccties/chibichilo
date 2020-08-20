import { MouseEvent } from "react";
import Typography from "@material-ui/core/Typography";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import MuiMenu from "@material-ui/core/Menu";
import MuiMenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import { PopupState, bindMenu } from "material-ui-popup-state/hooks";

type MenuItemSchema = {
  label: string;
  icon?: JSX.Element;
  disabled?: boolean;
  onClick: (event: MouseEvent<HTMLLIElement, globalThis.MouseEvent>) => void;
};

export type MenuItems = Array<MenuItemSchema | "divider">;

export function Menu(props: { popupState: PopupState; items: MenuItems }) {
  return (
    <MuiMenu {...bindMenu(props.popupState)}>
      {props.items.map((item, i) => {
        if (item === "divider") return <Divider key={i} />;
        return (
          <MuiMenuItem
            key={i}
            onClick={(...args) => {
              props.popupState.close();
              item.onClick(...args);
            }}
            disabled={item.disabled}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <Typography variant="inherit">{item.label}</Typography>
          </MuiMenuItem>
        );
      })}
    </MuiMenu>
  );
}
