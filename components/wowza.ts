import { useMemo } from "react";
import { jsonFetcher, useApi, makeFetcher } from "./api";

const initialData = {
  url: "",
  state: "pending" as const,
};

type WowzaResource = {
  url: string;
};

const wowzaResourceUrl = process.browser
  ? new URL(
      `${process.env.NEXT_PUBLIC_API_BASE_PATH}/call/wowza.php`,
      document.location.href
    ).href
  : "";

const fetchWowzaResource: (
  request: string
) => Promise<WowzaResource> = makeFetcher(
  // NOTE: for development
  process.env.NODE_ENV === "development"
    ? () => Promise.resolve({ url: "https://example/dummy" })
    : jsonFetcher,
  initialData
);

function buildRequest(src: string) {
  const params = new URLSearchParams();
  params.set("src", src);
  return new URL(`?${params.toString()}`, wowzaResourceUrl).href;
}

export function useWowzaResource(src: string) {
  const request = useMemo(() => buildRequest(src), [src]);
  return useApi(request, fetchWowzaResource, initialData);
}
