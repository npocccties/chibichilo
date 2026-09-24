import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  buildSearch,
  isRelativePath,
  normalizeQuery,
  toPath,
  type AppRouterUrl,
} from "$utils/toPath";

export type AppRouterPush = (
  url: AppRouterUrl,
  _as?: unknown,
  _options?: { shallow?: boolean }
) => Promise<boolean> | void;

function searchParamsToQuery(
  searchParams: URLSearchParams
): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {};
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    query[key] = values.length > 1 ? values : values[0];
  }
  return query;
}

export function useAppRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const query = useMemo(
    () => searchParamsToQuery(searchParams),
    [searchParams]
  );

  const navigateTo = useCallback(
    (url: AppRouterUrl, replace: boolean) => {
      if (isRelativePath(url) && typeof url === "object" && "pathname" in url) {
        void navigate(
          {
            pathname: url.pathname ?? ".",
            search: buildSearch(
              normalizeQuery(
                "query" in url &&
                  url.query != null &&
                  typeof url.query === "object"
                  ? url.query
                  : undefined
              )
            ),
          },
          { relative: "path", replace }
        );
        return;
      }

      void navigate(toPath(url), { replace });
    },
    [navigate]
  );

  const push = useCallback<AppRouterPush>(
    (url) => {
      navigateTo(url, false);
    },
    [navigateTo]
  );

  const replace = useCallback<AppRouterPush>(
    (url) => {
      navigateTo(url, true);
    },
    [navigateTo]
  );

  const back = useCallback(() => {
    void navigate(-1);
  }, [navigate]);

  return {
    push,
    replace,
    back,
    query,
    pathname: location.pathname,
    asPath: `${location.pathname}${location.search}${location.hash}`,
  };
}
