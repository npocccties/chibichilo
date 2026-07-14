import type { Dispatch, SetStateAction } from "react";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import Checkbox from "@mui/material/Checkbox";
import PreviewButton from "$atoms/PreviewButton";
import EditButton from "$atoms/EditButton";
import SharedIndicator from "$atoms/SharedIndicator";
import type { IsContentEditable } from "$server/models/content";
import type { LtiContextSchema } from "$server/models/ltiContext";
import type { LinkSchema } from "$server/models/link/content";
import type { BookSchema } from "$server/models/book";
import theme from "$theme";
import { useSessionAtom } from "$store/session";
import { isDisplayableBook } from "$utils/displayableBook";
import getLocaleDateTimeString from "$utils/getLocaleDateTimeString";
import Accordion from "./Accordion";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box } from "@mui/material";
import DescriptionList from "$atoms/DescriptionList";

type Props = {
  ltiContext: LtiContextSchema;
  links: Array<LinkSchema>;
  selected: Set<string>;
  select: Dispatch<SetStateAction<Set<string>>>;
  onTreeChange?(
    link: Pick<LinkSchema, "oauthClientId" | "ltiContext" | "ltiResourceLink">,
    checked: boolean
  ): void;
  onBookPreviewClick?(book: Pick<BookSchema, "id">): void;
  onBookEditClick?(book: Pick<BookSchema, "id" | "authors">): void;
  isContentEditable?: IsContentEditable;
};

type LinksTreeProps = {
  links: Array<LinkSchema>;
  selected: Set<string>;
  select: Dispatch<SetStateAction<Set<string>>>;
  onTreeChange?(
    link: Pick<LinkSchema, "oauthClientId" | "ltiContext" | "ltiResourceLink">,
    checked: boolean
  ): void;
  onBookPreviewClick?(book: Pick<BookSchema, "id">): void;
  onBookEditClick?(book: Pick<BookSchema, "id" | "authors">): void;
  isContentEditable?: IsContentEditable;
};

function LinksTree({
  links,
  selected,
  select,
  onTreeChange,
  onBookPreviewClick,
  onBookEditClick,
  isContentEditable,
}: LinksTreeProps) {
  const { session } = useSessionAtom();

  return (
    <>
      {links.map((link) => {
        const nodeId = [
          link.oauthClientId,
          link.ltiContext.id,
          link.ltiResourceLink?.id || "",
        ]
          .map(encodeURIComponent)
          .join(":");

        return (
          <SimpleTreeView
            key={nodeId}
            defaultExpandedItems={[nodeId]}
            slots={{
              collapseIcon: ExpandMoreIcon,
              expandIcon: ChevronRightIcon,
            }}
          >
            <TreeItem
              itemId={nodeId}
              onClick={(event) => {
                event.stopPropagation();
                (
                  event.currentTarget?.querySelector(
                    `input[type="checkbox"]`
                  ) as HTMLInputElement | null
                )?.click();
              }}
              label={
                <>
                  {onTreeChange && (
                    <Checkbox
                      checked={selected.has(JSON.stringify(link))}
                      color="primary"
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                      onChange={(event, checked) => {
                        event.stopPropagation();
                        select((selected) => {
                          const json = JSON.stringify(link);
                          if (checked) selected.add(json);
                          else selected.delete(json);
                          return new Set(selected);
                        });
                        onTreeChange(link, checked);
                      }}
                    />
                  )}
                  {link.ltiResourceLink.title &&
                    `(${link.ltiResourceLink.title}) → `}
                  {link.book.name}
                  {link.book.shared && (
                    <SharedIndicator
                      sx={{ margin: theme.spacing(-0.5, 0.5) }}
                    />
                  )}
                  {isDisplayableBook(
                    link.book,
                    isContentEditable,
                    session?.ltiResourceLink ?? undefined
                  ) && (
                    <PreviewButton
                      variant="book"
                      onClick={(event) => {
                        event.stopPropagation();
                        onBookPreviewClick?.(link.book);
                      }}
                    />
                  )}
                  {isContentEditable?.(link.book) && (
                    <EditButton
                      variant="book"
                      onClick={(event) => {
                        event.stopPropagation();
                        onBookEditClick?.(link.book);
                      }}
                    />
                  )}
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "left",
                      flexWrap: "wrap",
                      lineHeight: 2.5,
                    }}
                  >
                    <DescriptionList
                      nowrap
                      sx={{ ml: 5 }}
                      value={[
                        {
                          key: "作成日",
                          value: getLocaleDateTimeString(link.createdAt, "ja"),
                        },
                      ]}
                    />
                    <DescriptionList
                      nowrap
                      sx={{ mx: 2 }}
                      value={[
                        {
                          key: "更新日",
                          value: getLocaleDateTimeString(link.updatedAt, "ja"),
                        },
                      ]}
                    />
                  </Box>
                </>
              }
            />
          </SimpleTreeView>
        );
      })}
    </>
  );
}

export default function CourseTree(props: Props) {
  const {
    ltiContext,
    links,
    selected,
    select,
    onTreeChange,
    onBookPreviewClick,
    onBookEditClick,
    isContentEditable,
  } = props;
  const checked = links.every((link) => selected.has(JSON.stringify(link)));
  const indeterminate =
    !checked && links.some((link) => selected.has(JSON.stringify(link)));

  return (
    <Accordion
      summary={
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            lineHeight: 2.5,
          }}
        >
          {onTreeChange && (
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              color="primary"
              size="small"
              onClick={(e) => {
                // NOTE: TreeItemの展開をさせない
                e.stopPropagation();
              }}
              onChange={(event, checked) => {
                event.stopPropagation();
                select((selected) => {
                  const jsonl = links.map((link) => JSON.stringify(link));
                  if (checked) jsonl.forEach((json) => selected.add(json));
                  else jsonl.forEach((json) => selected.delete(json));
                  return new Set(selected);
                });
                links.forEach((link) => {
                  onTreeChange(link, checked);
                });
              }}
            />
          )}
          {ltiContext.title}
        </Box>
      }
      details={
        <LinksTree
          links={links}
          selected={selected}
          select={select}
          onTreeChange={onTreeChange}
          onBookPreviewClick={onBookPreviewClick}
          onBookEditClick={onBookEditClick}
          isContentEditable={isContentEditable}
        />
      }
    />
  );
}
