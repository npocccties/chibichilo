export type LinkSearchQuery = {
  /** コンテンツ種別 */
  type: "link";
  /** 検索文字列 (コース名) */
  text: string[];
  /** 提供されているLMS */
  oauthClientId: string[];
};