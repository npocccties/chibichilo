/** 字幕トラック一覧（Video.js v8 互換の形を維持） */
export type VideoJsTextTrackList = TextTrackList &
  Array<{
    kind: "subtitles";
    src: string;
    srclang: string;
    label: string;
    mode?: string;
    language?: string;
  }>;
