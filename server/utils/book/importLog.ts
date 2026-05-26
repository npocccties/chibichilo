const IMPORT_LOG_PREFIX = "[book-import]";

/** ブック／トピック import の調査用ログ（標準出力） */
export function importLog(
  step: string,
  detail?: Record<string, unknown>
): void {
  const suffix = detail === undefined ? "" : ` ${JSON.stringify(detail)}`;
  console.log(
    `${new Date().toISOString()} ${IMPORT_LOG_PREFIX} ${step}${suffix}`
  );
}

export function isImportApiRoute(method: string, url: string): boolean {
  const route = `${method} ${url}`;
  return (
    route.includes("/import") &&
    (route.includes("/books") || route.includes("/topics"))
  );
}
