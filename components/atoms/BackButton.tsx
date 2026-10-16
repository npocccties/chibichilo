import type { ComponentProps } from "react";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type Props = Pick<ComponentProps<typeof Button>, "onClick" | "className"> & {
  children: React.ReactNode;
};

export default function BackButton(props: Props) {
  const { children, onClick, className } = props;
  return (
    <Button
      size="small"
      color="primary"
      variant="text"
      onClick={onClick}
      className={className}
    >
      <ArrowBackIcon sx={{ mr: 1 }} />
      {children}
    </Button>
  );
}
