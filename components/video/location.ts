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

export function videoLocationType(url: URL): VideoLocation["type"] {
  const type = hosts.find(({ reg }) => hostMatcher(reg, url.host))?.type;
  return type ?? "wowza";
}
