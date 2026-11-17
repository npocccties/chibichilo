import { styled } from "@mui/material/styles";
import Switch, { switchClasses } from "@mui/material/Switch";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import LinkIcon from "@mui/icons-material/Link";
import { common, blue } from "@mui/material/colors";

const LinkSwitch = styled((props: Parameters<typeof Switch>[0]) => (
  <Switch
    {...props}
    icon={
      <span className={switchClasses.thumb}>
        <LinkOffIcon />
      </span>
    }
    checkedIcon={
      <span className={switchClasses.thumb}>
        <LinkIcon />
      </span>
    }
  />
))(({ theme }) => ({
  width: 66,
  height: 46,
  padding: theme.spacing(1.5),
  [`.${switchClasses.thumb}`]: {
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: common.white,
    borderRadius: "50%",
    boxShadow: theme.shadows[1],
    "& > svg": {
      fill: common.black,
    },
  },
  [`.${switchClasses.track}`]: {
    borderRadius: "11px",
  },
  [`.${switchClasses.checked}`]: {
    [`.${switchClasses.thumb}`]: {
      backgroundColor: blue[500],
      "& > svg": {
        fill: common.white,
      },
    },
  },
}));

export default LinkSwitch;
