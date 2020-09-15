export type VideoLocation = {
  type: "youtube" | "vimeo" | "wowza";
  src: string;
};

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

export function location(url: URL): VideoLocation {
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
    default:
      return { type: "wowza", src: url.href };
  }
}
