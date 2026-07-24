import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import type { ContentSchema } from "$server/models/content";
import type { BookSchema } from "$server/models/book";
import type { SessionSchema } from "$server/models/session";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import { useSessionAtom } from "$store/session";
import { useSearchAtom } from "$store/search";
import {
  destroyLtiResourceLink,
  updateLtiResourceLink,
} from "$utils/ltiResourceLink";
import { revalidateContents } from "./useContents";
import { pagesPath } from "./$path";

/**
 * セッションのltiResourceLinkRequestからltiResourceLinkを作成
 * @param session セッション
 * @return creatorIdとbookIdを除いたLTIリソースリンク
 */
function getLtiResourceLink(
  session?: SessionSchema
): Omit<LtiResourceLinkSchema, "creatorId" | "bookId"> | undefined {
  if (session == null) return;
  if (session.ltiResourceLinkRequest?.id == null) return;

  const ltiResourceLink = {
    consumerId: session.oauthClient.id,
    id: session.ltiResourceLinkRequest.id,
    title: session.ltiResourceLinkRequest.title ?? "",
    contextId: session.ltiContext.id,
    contextTitle: session.ltiContext.title ?? "",
    contextLabel: session.ltiContext.label ?? "",
  };

  return ltiResourceLink;
}

function useBookLinkingHandlers() {
  const router = useRouter();
  const { session } = useSessionAtom();
  const ltiResourceLink = useMemo(() => getLtiResourceLink(session), [session]);
  const { query } = useSearchAtom();

  const update = useCallback(
    async (
      bookId: BookSchema["id"],
      ltiResourceLink?: Omit<LtiResourceLinkSchema, "creatorId" | "bookId">
    ) => {
      if (session?.ltiMessageType === "LtiDeepLinkingRequest") {
        await router.push(pagesPath.book.linking.$url({ query: { bookId } }));
        return;
      }

      if (ltiResourceLink) {
        await updateLtiResourceLink({ ...ltiResourceLink, bookId });
        return;
      }
    },
    [router, session]
  );

  const destroy = useCallback(
    async (
      ltiResourceLink?: Omit<LtiResourceLinkSchema, "creatorId" | "bookId">
    ) => {
      if (ltiResourceLink == null) return;

      await destroyLtiResourceLink(ltiResourceLink);
    },
    []
  );

  const onBookLinking = useCallback(
    async (content: Pick<BookSchema, "id"> | ContentSchema, linking = true) => {
      if ("type" in content && content.type !== "book") return;

      if (linking) {
        await update(content.id, ltiResourceLink);
      } else {
        await destroy(ltiResourceLink);
      }

      await revalidateContents(query);
    },
    [update, destroy, ltiResourceLink, query]
  );

  // LTI Resource Link Request かつ Target URI が設定済みの場合は変更禁止
  if (
    session?.ltiMessageType === "LtiResourceLinkRequest" &&
    Boolean(session?.ltiTargetLinkUri)
  ) {
    return {};
  }

  return { onBookLinking };
}

export default useBookLinkingHandlers;
