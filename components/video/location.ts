import { validUrl } from "../validUrl";

const hosts = [
  {
    type: "youtube" as const,
    reg: /(^|\.)youtube\.com$/,
  },
  {
    type: "vimeo" as const,
    reg: /^vimeo\.com$/,
  },
];

function hostMatcher(reg: RegExp, host: string): boolean {
  return reg.test(host);
}

function locationType(url: URL): VideoLocation["type"] {
  const type = hosts.find(({ reg }) => hostMatcher(reg, url.host))?.type;
  return type ?? "wowza";
}

export function parseLocation(value: string): Partial<VideoLocation> {
  if (!validUrl(value)) return { src: value };

  const url = new URL(value);
  switch (locationType(url)) {
    case "youtube": {
      const src = url.searchParams.get("v") ?? "";
      return { type: "youtube", src };
    }
    case "vimeo": {
      const src =
        url.pathname.split("/").find((path) => /^\d+$/.test(path)) ?? "";
      return { type: "vimeo", src };
    }
    case "wowza":
      return { type: "wowza", src: value };
  }
}
