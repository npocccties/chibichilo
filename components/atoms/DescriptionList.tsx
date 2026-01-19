import clsx from "clsx";
import type { SxProps } from "@mui/system";
import { styled } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

const List = styled("dl")<Pick<Props, "color" | "fontSize">>(
  ({ theme, color, fontSize }) => ({
    margin: 0,
    lineHeight: 1.25,
    color,
    fontSize,
    "& > .item": {
      display: "flex",
      alignItems: "center",
      "&:not(:last-child)": {
        marginBottom: theme.spacing(0.5),
      },
      "& > dt::after": {
        content: "':'",
        marginRight: theme.spacing(0.25),
      },
      "& > dd": {
        margin: 0,
      },
    },
    "&.inline": {
      "& > .item": {
        display: "inline-flex",
        "&:not(:last-child)": {
          marginRight: theme.spacing(1.25),
        },
      },
    },
    "&.nowrap": {
      whiteSpace: "nowrap",
      "&.inline, &:not(.inline) > .item > dd": {
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    },
  })
);

type Props = {
  className?: string;
  color?: string;
  fontSize?: string;
  inline?: boolean;
  nowrap?: boolean;
  sx?: SxProps;
  value: Array<{ key: string; value: React.ReactNode }>;
};

export default function DescriptionList({
  className,
  color = grey[700],
  fontSize = "0.75rem",
  inline = false,
  nowrap = false,
  sx,
  value,
}: Props) {
  return (
    <List
      className={clsx(className, { inline, nowrap })}
      color={color}
      fontSize={fontSize}
      sx={sx}
    >
      {value.map(({ key, value }, index) => (
        <div key={index} className="item">
          {key && <dt>{key}</dt>}
          <dd>{value}</dd>
        </div>
      ))}
    </List>
  );
}
