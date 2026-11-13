import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  buildSearch,
  isRelativePath,
  normalizeQuery,
  resolveRelativePathname,
  toPath,
  type AppRouterUrl,
} from "$utils/toPath";

export type AppRouterPush = (url: AppRouterUrl) => Promise<boolean> | void;

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
        const pathname = resolveRelativePathname(
          url.pathname ?? ".",
          location.pathname
        );
        void navigate(
          {
            pathname,
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
          { replace }
        );
        return;
      }

      void navigate(toPath(url), { replace });
    },
    [navigate, location.pathname]
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
