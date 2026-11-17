import { useCallback, useMemo } from "react";
import { useAppRouter } from "$utils/useAppRouter";
import { useAtomValue, useSetAtom } from "jotai";
import type { ContentSchema } from "$server/models/content";
import type { BookSchema } from "$server/models/book";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { LtiContextState } from "$store/session";
import {
  useLtiContextAtom,
  baseLtiContextAtom,
  updateBaseLtiContextAtom,
} from "$store/session";
import { useSearchAtom } from "$store/search";
import {
  destroyLtiResourceLink,
  updateLtiResourceLink,
} from "$utils/ltiResourceLink";
import { revalidateContents } from "./useContents";
import { bookLinkingUrl } from "$utils/routes";
import type { TopicSchema } from "$server/models/topic";

function getLtiResourceLink(
  ltiContext?: LtiContextState
): Omit<LtiResourceLinkSchema, "creatorId" | "bookId"> | undefined {
  if (!ltiContext?.ltiContextId || !ltiContext?.ltiConsumerId) return;

  const linkId =
    ltiContext.ltiResourceLinkRequest?.id ?? ltiContext.ltiResourceLink?.id;
  if (!linkId) return;

  return {
    consumerId: ltiContext.ltiConsumerId,
    id: linkId,
    title:
      ltiContext.ltiResourceLinkRequest?.title ??
      ltiContext.ltiResourceLink?.title ??
      "",
    contextId: ltiContext.ltiContextId,
    contextTitle: ltiContext.ltiContext?.title ?? "",
    contextLabel: ltiContext.ltiContext?.label ?? "",
  };
}

function useBookLinkingHandlers() {
  const router = useAppRouter();
  const ltiContext = useLtiContextAtom();
  const baseLtiContext = useAtomValue(baseLtiContextAtom);
  const setBaseLtiContext = useSetAtom(updateBaseLtiContextAtom);

  const ltiResourceLink = useMemo(
    () => getLtiResourceLink(ltiContext),
    [ltiContext]
  );
  const { query } = useSearchAtom();

  const update = useCallback(
    async (
      bookId: BookSchema["id"],
      ltiResourceLink?: Omit<LtiResourceLinkSchema, "creatorId" | "bookId">,
      topicId?: TopicSchema["id"]
    ) => {
      if (ltiContext?.ltiMessageType === "LtiDeepLinkingRequest") {
        await router.push(bookLinkingUrl({ bookId, topicId }));
        return;
      }

      if (ltiResourceLink) {
        await updateLtiResourceLink({ ...ltiResourceLink, bookId });

        const currentLink = baseLtiContext.ltiResourceLink;
        setBaseLtiContext({
          ...baseLtiContext,
          ltiResourceLink: {
            ...currentLink,
            ...ltiResourceLink,
            creatorId: currentLink?.creatorId ?? null,
            bookId,
          },
        });
        return;
      }
    },
    [router, ltiContext, baseLtiContext, setBaseLtiContext]
  );

  const destroy = useCallback(
    async (
      ltiResourceLink?: Omit<LtiResourceLinkSchema, "creatorId" | "bookId">
    ) => {
      if (ltiResourceLink == null) return;

      await destroyLtiResourceLink(ltiResourceLink);

      // 👇 常に本タブの baseLtiContext の ltiResourceLink を null にクリア
      setBaseLtiContext({
        ...baseLtiContext,
        ltiResourceLink: null,
      });
    },
    [baseLtiContext, setBaseLtiContext]
  );

  const onBookLinking = useCallback(
    async (
      content: Pick<BookSchema, "id"> | ContentSchema,
      linking = true,
      topicId?: TopicSchema["id"]
    ) => {
      if ("type" in content && content.type !== "book") return;

      if (linking) {
        await update(
          content.id,
          ltiResourceLink,
          topicId ? Number(topicId) : undefined
        );
      } else {
        await destroy(ltiResourceLink);
      }

      await revalidateContents(query);
    },
    [update, destroy, ltiResourceLink, query]
  );
  if (
    ltiContext?.ltiMessageType === "LtiResourceLinkRequest" &&
    Boolean(ltiContext?.ltiTargetLinkUri)
  ) {
    return {};
  }
  return { onBookLinking };
}

export default useBookLinkingHandlers;
