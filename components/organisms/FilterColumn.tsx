import type { SxProps } from "@mui/system";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import AuthorFilter from "$atoms/AuthorFilter";
import CourseChip from "$atoms/CourseChip";
import KeywordChip from "$atoms/KeywordChip";
import TextField from "$atoms/TextField";
import licenses from "$utils/licenses";
import { useSearchAtom } from "$store/search";
import BookChip from "$atoms/BookChip";

type Props = {
  sx?: SxProps;
  variant: "book" | "topic";
};

export default function FilterColumn({ sx, variant }: Props) {
  const {
    query,
    searchQuery,
    relatedBooks,
    onAuthorFilterChange,
    onLicenseFilterChange,
    onLtiContextDelete,
    onKeywordDelete,
    onRelatedBookDelete,
  } = useSearchAtom();

  return (
    <Box sx={sx}>
      <Typography sx={{ pt: 4, mb: 4 }} variant="h5">
        絞り込み
      </Typography>
      <AuthorFilter
        value={query.filter}
        sx={{ display: "flex", mb: 2 }}
        onFilterChange={onAuthorFilterChange}
      />
      <TextField
        label="ライセンス"
        select
        fullWidth
        defaultValue="all"
        onChange={(event) => {
          onLicenseFilterChange(String(event.target.value));
        }}
        inputProps={{ displayEmpty: true }}
        sx={{ mb: 2, maxWidth: "80%" }}
      >
        <MenuItem value="all">すべて</MenuItem>
        <MenuItem value="none">未設定</MenuItem>
        {Object.entries(licenses).map(([value, { name }]) => (
          <MenuItem key={value} value={value}>
            {name}
          </MenuItem>
        ))}
      </TextField>
      {variant === "book" && (
        <FormControl component="fieldset" sx={{ display: "block", mb: 2 }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            コース
          </FormLabel>
          {(searchQuery.link?.length ?? 0) === 0 && (
            <Typography>なし</Typography>
          )}
          {searchQuery.link?.map((ltiResourceLink) => (
            <CourseChip
              sx={{ mr: 0.5 }}
              key={ltiResourceLink.contextId}
              ltiResourceLink={ltiResourceLink}
              onDelete={() => onLtiContextDelete(ltiResourceLink)}
            />
          ))}
        </FormControl>
      )}
      {variant === "topic" && (
        <FormControl component="fieldset" sx={{ display: "block", mb: 2 }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            ブック
          </FormLabel>
          {(searchQuery.book?.length ?? 0) === 0 && (
            <Typography>なし</Typography>
          )}
          {relatedBooks?.map((relatedBook) => {
            return (
              relatedBook && (
                <BookChip
                  sx={{ mr: 0.5 }}
                  key={relatedBook.id}
                  relatedBook={relatedBook}
                  onRelatedBookDelete={onRelatedBookDelete}
                />
              )
            );
          })}
        </FormControl>
      )}
      <FormControl component="fieldset" sx={{ display: "block" }}>
        <FormLabel component="legend" sx={{ mb: 1 }}>
          キーワード
        </FormLabel>
        {(searchQuery.keyword?.length ?? 0) === 0 && (
          <Typography>なし</Typography>
        )}
        {searchQuery.keyword?.map((keyword) => (
          <KeywordChip
            key={keyword}
            keyword={{ name: keyword }}
            sx={{ mr: 0.5 }}
            onDelete={() => onKeywordDelete(keyword)}
          />
        ))}
      </FormControl>
    </Box>
  );
}
