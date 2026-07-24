import ReactMarkdown from "react-markdown";
import type { NormalComponents } from "react-markdown/lib/complex-types";
import gfm from "remark-gfm";
import breaks from "remark-breaks";
import Link from "@mui/material/Link";
import { css } from "@emotion/css";

const MarkdownLink: NormalComponents["a"] = (props) => (
  <Link target="_blank" rel="noreferrer" component="a" {...props} />
);

const components = {
  a: MarkdownLink,
} as const;

const root = css({
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
    <ReactMarkdown
      className={root}
      remarkPlugins={[gfm, breaks]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
