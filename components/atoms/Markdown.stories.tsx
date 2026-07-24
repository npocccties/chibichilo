export default { title: "atoms/Markdown" };

import Markdown from "./Markdown";
import outdent from "outdent";

export const Default = () => (
  <Markdown>
    {outdent`
    # h1

    ## h2

    ### h3

    #### h4

    ###### h5

    ###### h6

    paragraph
    paragraph
  `}
  </Markdown>
);
