import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import TheatersIcon from "@material-ui/icons/Theaters";
import LibraryAddIcon from "@material-ui/icons/LibraryAdd";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import LinkIcon from "@material-ui/icons/Link";
import { PopupState } from "material-ui-popup-state/hooks";
import { useRouter } from "./router";
import { UrlObject } from "url";
import { Menu } from "./Menu";

type AppMenuItem = {
  title: string;
  icon?: JSX.Element;
  href: string | UrlObject;
};
type AppMenu = Array<AppMenuItem | "divider">;

const menuItems: AppMenu = [
  {
    title: "学習コンテンツ管理",
    icon: <LibraryBooksIcon />,
    href: "/contents",
  },
  {
    title: "ビデオ管理",
    icon: <TheatersIcon />,
    href: "/videos",
  },
  "divider",
  {
    title: "学習コンテンツを作成する",
    icon: <LibraryAddIcon />,
    href: {
      pathname: "/contents",
      query: {
        action: "new",
      },
    },
  },
  {
    title: "ビデオを追加する",
    icon: <AddCircleIcon />,
    href: {
      pathname: "/videos",
      query: {
        action: "new",
      },
    },
  },
  "divider",
  {
    title: "LMS 連携",
    icon: <LinkIcon />,
    href: "/edit",
  },
];

export function TopAppMenu(props: { popupState: PopupState }) {
  const router = useRouter();

  return (
    <Menu
      popupState={props.popupState}
      items={menuItems.map((item) => {
        if (typeof item === "string") return item;
        return {
          label: item.title,
          icon: item.icon,
          onClick: () => {
            router.push(item.href);
          },
        };
      })}
    />
  );
}
