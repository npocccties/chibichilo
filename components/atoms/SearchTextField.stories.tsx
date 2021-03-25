export default { title: "atoms/SearchTextField" };
import SearchTextField from "./SearchTextField";

export const Default = () => (
  <SearchTextField label="ブックの検索" onSearchInput={console.log} />
);
