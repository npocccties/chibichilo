import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import gfm from "remark-gfm";
import breaks from "remark-breaks";
import Link from "@mui/material/Link";
import { css } from "@emotion/css";

const components = {
  a({ href, children }) {
    return (
      <Link href={href} target="_blank" rel="noreferrer">
        {children}
      </Link>
    );
  },
} satisfies Components;

const root = css({
  minWidth: 0,
  maxWidth: "100%",
  overflowWrap: "anywhere",
  "& p, & li, & blockquote, & td, & th": {
    overflowWrap: "anywhere",
  },
  "& pre, & code": {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  "> :first-child": {
    marginTop: 0,
  },
  "> :last-child": {
    marginBottom: 0,
  },
});

type Props = Pick<Parameters<typeof ReactMarkdown>[0], "children">;

export default function Markdown({ children }: Props) {
  return (
    <div className={root}>
      <ReactMarkdown remarkPlugins={[gfm, breaks]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
