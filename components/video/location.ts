import { validUrl } from "../validUrl";

type Matcher = {
  host: RegExp;
  type: VideoLocation["type"];
  src: (url: URL) => VideoLocation["src"];
};

const matchers: Array<Matcher> = [
  {
    host: /(^|\.)youtube\.com$/,
    type: "youtube",
    src: (url) => url.searchParams.get("v") ?? "",
  },
  {
    host: /^youtu\.be$/,
    type: "youtube",
    src: (url) => url.pathname.split("/")[1] ?? "",
  },
  {
    host: /^vimeo\.com$/,
    type: "vimeo",
    src: (url) =>
      url.pathname.split("/").find((path) => /^\d+$/.test(path)) ?? "",
  },
];

const hostMatch = (url: URL) => (matcher: Matcher): boolean =>
  matcher.host.test(url.host);

function match(url: URL): VideoLocation | undefined {
  const location = matchers.find(hostMatch(url));
  return location && { type: location.type, src: location.src(url) };
}

export function parse(value: string): Partial<VideoLocation> {
  if (!validUrl(value)) return { src: value };
  return match(new URL(value)) ?? { type: "wowza", src: value };
}
