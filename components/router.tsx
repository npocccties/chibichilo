import MuiLink from "@material-ui/core/Link";
import NextLink from "next/link";
import { UrlObject, format } from "url";
import { ReactNode, useCallback } from "react";
import { useRouter as useNextRouter } from "next/router";
import { validUrl } from "./validUrl";

function urlHandler(urlOrPath: string | UrlObject) {
  return (
    validUrl(urlOrPath)?.href ??
    (typeof urlOrPath === "string"
      ? `${urlOrPath}.html`
      : format({
          ...urlOrPath,
          pathname: `${urlOrPath.pathname}.html`,
        }))
  );
}

export const Link = (props: {
  href: string | UrlObject;
  children: ReactNode;
}) => {
  const url = urlHandler(props.href);

  return (
    <NextLink href={props.href} as={url}>
      <MuiLink variant="body1" href={url}>
        {props.children}
      </MuiLink>
    </NextLink>
  );
};

export function useRouter() {
  const router = useNextRouter();

  const originalPush = router.push;
  router.push = useCallback(
    (urlOrPath: string | UrlObject) => {
      return originalPush(urlOrPath, urlHandler(urlOrPath));
    },
    [originalPush]
  );

  const originalReplace = router.replace;
  router.replace = useCallback(
    (urlOrPath: string | UrlObject) => {
      return originalReplace(urlOrPath, urlHandler(urlOrPath));
    },
    [originalReplace]
  );

  return router;
}
