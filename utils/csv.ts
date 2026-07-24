import json2csv from "json2csv";

const bom = "\uFEFF";

/**
 * ブラウザーでデータをCSVファイル(BOM付きUTF-8)に変換しエクスポート
 * @param data データ
 * @param filename ダウンロードするファイル名
 */
export function download(
  data: Array<Record<string, string | number | undefined>>,
  filename: string
) {
  if (data.length === 0) return;
  const csv = json2csv.parse(data);
  const file = new File([bom, csv], filename, { type: "text/csv" });
  const dataUrl = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.download = filename;
  anchor.href = dataUrl;
  anchor.click();
}
