import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ActionHeader from "$organisms/ActionHeader";
import ContentTypeIndicator from "$atoms/ContentTypeIndicator";
import ContentPreview from "$organisms/ContentPreview";
import SearchPagination from "$organisms/SearchPagination";
import Search from "$organisms/Search";
import SortSelect from "$atoms/SortSelect";
import type { ContentSchema } from "$server/models/content";
import type { LinkedBook } from "$types/linkedBook";
import { useSearchAtom } from "$store/search";
import AuthorFilter from "$atoms/AuthorFilter";
import SharedFilter from "$atoms/SharedFilter";
import type { SharedFilterType } from "$types/sharedFilter";
import type { AccordionProps } from "@mui/material/Accordion";
import MuiAccordion from "@mui/material/Accordion";
import type { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import type { AccordionDetailsProps } from "@mui/material/AccordionDetails";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import { styled } from "@mui/material/styles";

export type Props = {
  totalCount: number;
  contents: ContentSchema[];
  linkedBook?: LinkedBook;
  loading?: boolean;
  onContentPreviewClick(content: ContentSchema): void;
  onContentLinkClick?(content: ContentSchema, checked: boolean): void;
};

export default function DeepLinkBooks(props: Props) {
  const {
    totalCount,
    contents,
    linkedBook,
    loading = false,
    onContentPreviewClick,
    onContentLinkClick,
  } = props;
  const searchProps = useSearchAtom();

  return (
    <Box margin={2}>
      <ActionHeader>
        <ContentTypeIndicator type="book" />
        <SortSelect onSortChange={searchProps.onSortChange} />
      </ActionHeader>
      <Accordion>
        <AccordionSummary>
          <p>検索・絞り込み</p>
        </AccordionSummary>
        <AccordionDetails>
          <Search
            label="ブック・トピック検索"
            value={searchProps.input}
            target={searchProps.target}
            onSearchInput={searchProps.onSearchInput}
            onSearchInputReset={searchProps.onSearchInputReset}
            onSearchSubmit={searchProps.onSearchSubmit}
            onSearchTargetChange={searchProps.onSearchTargetChange}
          />
          <Typography variant="h5" sx={{ pt: 2, pb: 2 }}>
            絞り込み
          </Typography>
          <AuthorFilter
            value={searchProps.query.filter}
            sx={{ display: "flex", flexDirection: "row", mb: 2 }}
            onFilterChange={searchProps.onAuthorFilterChange}
            row={true}
          />
          <SharedFilter
            value={
              String(
                searchProps.searchQuery?.shared?.[0] ?? "all"
              ) as SharedFilterType
            }
            sx={{ display: "flex", mb: 2 }}
            disabled={searchProps.query.filter === "other"}
            onFilterChange={searchProps.onSharedFilterChange}
            row={true}
          />
        </AccordionDetails>
      </Accordion>
      <Box display="grid" margin={2} gap={2} gridTemplateColumns="1fr 1fr">
        {contents.map((content) => (
          <ContentPreview
            key={content.id}
            content={content}
            linked={content.id === linkedBook?.id}
            onContentPreviewClick={onContentPreviewClick}
            onContentEditClick={undefined}
            onContentLinkClick={onContentLinkClick}
            onLtiContextClick={searchProps.onLtiContextClick}
            onKeywordClick={searchProps.onKeywordClick}
          />
        ))}
        {loading &&
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} height={324} /* TODO: 妥当な値にしてほしい */ />
          ))}
      </Box>
      <SearchPagination totalCount={totalCount} />
    </Box>
  );
}

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion {...props} />
))({
  margin: 0,
  boxShadow: "none",
  "&:before": {
    display: "none",
  },
});

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  padding: 0,
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper": {
    margin: theme.spacing(1),
  },
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    margin: 0,
  },
  "& .MuiAccordionSummary-content.Mui-expanded": {
    margin: 0,
  },
}));

const AccordionDetails = styled((props: AccordionDetailsProps) => (
  <MuiAccordionDetails {...props} />
))(({ theme }) => ({
  "& > :not(:first-child)": {
    marginTop: theme.spacing(2.5),
  },
}));
