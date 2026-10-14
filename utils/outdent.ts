function dedent(text: string): string {
  const lines = text
    .replace(/^\n/, "")
    .replace(/\n\s*$/, "")
    .split("\n");
  const indent = lines.reduce((min, line) => {
    if (line.trim() === "") return min;
    const leading = line.match(/^ */)?.[0].length ?? 0;
    return Math.min(min, leading);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(indent) || indent === 0) {
    return lines.join("\n");
  }

  return lines.map((line) => line.slice(indent)).join("\n");
}

/**
 * テンプレートリテラルの共通インデントを除去する
 */
export default function outdent(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return dedent(String.raw({ raw: strings }, ...values));
}
