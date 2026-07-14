import Button from "@mui/material/Button";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Collapse from "@mui/material/Collapse";

type Props = {
  expanded: boolean;
  label?: React.ReactNode;
  "aria-controls"?: string;
  children: React.ReactNode;
  onCollapsibleContentClick?: Parameters<typeof Button>[0]["onClick"];
};

export default function CollapsibleContent({
  expanded,
  label,
  children,
  "aria-controls": ariaControls,
  onCollapsibleContentClick,
}: Props) {
  return (
    <>
      {label && (
        <Button
          variant="text"
          aria-expanded={expanded}
          aria-controls={ariaControls}
          onClick={onCollapsibleContentClick}
        >
          <ChevronRightIcon
            sx={(theme) => ({
              transition: theme.transitions.create("transform"),
              ...(expanded ? { transform: "rotate(90deg)" } : {}),
            })}
          />
          {label}
        </Button>
      )}
      <Collapse in={expanded}>{children}</Collapse>
    </>
  );
}
