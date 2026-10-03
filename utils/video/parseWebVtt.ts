export type ParsedVttCue = {
  startTime: number;
  endTime: number;
  text: string;
};

/** WebVTT 時刻文字列を秒に変換する */
export function parseVttTimestamp(value: string): number {
  const parts = value.trim().split(":");
  if (parts.length === 3) {
    return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
  }
  if (parts.length === 2) {
    return Number(parts[0]) * 60 + Number(parts[1]);
  }
  return Number(parts[0]) || 0;
}

/**
 * 簡易 WebVTT パーサ（字幕表示用）。
 * STYLE / REGION / NOTE ブロックはスキップする。
 */
export function parseWebVtt(source: string): ParsedVttCue[] {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/);
  const cues: ParsedVttCue[] = [];
  let index = 0;

  if (lines[0]?.startsWith("WEBVTT")) {
    index = 1;
    while (index < lines.length && lines[index].trim() !== "") index++;
  }

  while (index < lines.length) {
    while (index < lines.length && lines[index].trim() === "") index++;
    if (index >= lines.length) break;

    const header = lines[index];
    if (/^(NOTE|STYLE|REGION)(?:\s|$)/.test(header)) {
      index++;
      while (index < lines.length && lines[index].trim() !== "") index++;
      continue;
    }

    if (!header.includes("-->")) {
      index++;
      if (index >= lines.length || !lines[index].includes("-->")) continue;
    }

    const timingLine = lines[index++];
    const match = timingLine.match(/([\d:.]+)\s*-->\s*([\d:.]+)(?:\s+(.*))?$/);
    if (!match) continue;

    const textLines: string[] = [];
    while (index < lines.length && lines[index].trim() !== "") {
      textLines.push(lines[index++]);
    }

    cues.push({
      startTime: parseVttTimestamp(match[1]),
      endTime: parseVttTimestamp(match[2]),
      text: textLines.join("\n").replace(/<\/?[^>]+>/g, ""),
    });
  }

  return cues;
}

/** 指定時刻に表示すべきキュー文字列を返す */
export function getActiveCueText(
  cues: readonly ParsedVttCue[],
  currentTime: number
): string {
  return cues
    .filter((cue) => cue.startTime <= currentTime && currentTime < cue.endTime)
    .map((cue) => cue.text)
    .join("\n");
}
