/**
 * ISO 639-1 言語コードのネイティブ名称を返す
 */
export default function getLanguageNativeName(language: string): string {
  if (!/^[a-z]{2}$/i.test(language)) {
    return language;
  }

  try {
    return (
      new Intl.DisplayNames([language], { type: "language" }).of(language) ??
      language
    );
  } catch {
    return language;
  }
}
