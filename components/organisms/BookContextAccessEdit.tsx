import { useMemo, useState, useEffect } from "react";
import {
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  Button,
  Chip,
} from "@mui/material";
import type {
  BookSchema,
  LtiContextBookAccessProps,
} from "$server/models/book";
import { useSessionAtom } from "$store/session";

export type Props = {
  book: BookSchema;
  onChange: (settings: LtiContextBookAccessProps[]) => void;
};

export default function BookContextAccessEdit({ book, onChange }: Props) {
  // TODO: Currently, values are retrieved from the backend session (`useSessionAtom`),
  // leading to an issue where the "current course" display in the active tab is overwritten
  // if an instructor opens an LTI link for a different course in another tab (the "separate tab issue").
  // Once the `baseContext` implementation currently in progress on another branch is merged,
  // update the code to retrieve `ConsumerId` and `contextId`
  // from the fixed context (`baseContext`) upon the initial tab load.
  const { session } = useSessionAtom();
  const currentConsumerId = session?.ltiResourceLink?.consumerId;
  const currentContextId = session?.ltiResourceLink?.contextId;

  const uniqueContexts = useMemo(() => {
    const map = new Map<
      string,
      { consumerId: string; contextId: string; title: string }
    >();
    book.ltiResourceLinks.forEach((link) => {
      const key = `${link.consumerId}_${link.contextId}`;
      if (!map.has(key)) {
        map.set(key, {
          consumerId: link.consumerId,
          contextId: link.contextId,
          title: link.contextTitle || `コース (${link.contextId})`,
        });
      }
    });
    return Array.from(map.values());
  }, [book.ltiResourceLinks]);

  const [localSettings, setLocalSettings] = useState<
    LtiContextBookAccessProps[]
  >([]);

  useEffect(() => {
    if (book.ltiContextBookAccesses) {
      setLocalSettings(
        book.ltiContextBookAccesses.map((acc) => ({
          consumerId: acc.consumerId,
          contextId: acc.contextId,
          allowViewing: acc.allowViewing,
        }))
      );
    } else {
      setLocalSettings([]);
    }
  }, [book.ltiContextBookAccesses]);

  const isDirty = useMemo(() => {
    const original = book.ltiContextBookAccesses || [];
    if (original.length !== localSettings.length) return true;
    return localSettings.some((ls) => {
      const orig = original.find(
        (o) => o.consumerId === ls.consumerId && o.contextId === ls.contextId
      );
      if (!orig) return true;
      return orig.allowViewing !== ls.allowViewing;
    });
  }, [book.ltiContextBookAccesses, localSettings]);

  const getAccessSetting = (consumerId: string, contextId: string) => {
    return (
      localSettings.find(
        (acc) => acc.consumerId === consumerId && acc.contextId === contextId
      ) ?? { allowViewing: true }
    );
  };

  const getDropdownValue = (setting: { allowViewing: boolean }) => {
    if (!setting.allowViewing) return "NONE";
    return "FULL";
  };

  const handleChange = (
    consumerId: string,
    contextId: string,
    value: string
  ) => {
    const newSettings = localSettings.filter(
      (acc) => !(acc.consumerId === consumerId && acc.contextId === contextId)
    );

    let allowViewing = true;
    if (value === "NONE") {
      allowViewing = false;
    }

    newSettings.push({
      consumerId,
      contextId,
      allowViewing,
    });

    setLocalSettings(newSettings);
  };

  const handleSubmit = () => {
    if (!isDirty) return;
    const payload: LtiContextBookAccessProps[] = uniqueContexts.map((ctx) => {
      const currentSetting = getAccessSetting(ctx.consumerId, ctx.contextId);
      return {
        consumerId: ctx.consumerId,
        contextId: ctx.contextId,
        allowViewing: currentSetting.allowViewing,
      };
    });
    onChange(payload);
  };

  if (uniqueContexts.length === 0) return null;

  return (
    <Box
      sx={{ border: "1px solid #e0e0e0", borderRadius: 1, bgcolor: "#fafafa" }}
    >
      <Box sx={{ p: 2 }}>
        {uniqueContexts.map((ctx) => {
          const setting = getAccessSetting(ctx.consumerId, ctx.contextId);
          const isCurrentCourse =
            ctx.consumerId === currentConsumerId &&
            ctx.contextId === currentContextId;
          return (
            <Box
              key={`${ctx.consumerId}_${ctx.contextId}`}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: uniqueContexts.length > 1 ? 2 : 0,
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  mr: 2,
                }}
              >
                <Typography variant="body1">{ctx.title}</Typography>
                {isCurrentCourse && (
                  <Chip
                    label="現在のコース"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                  />
                )}
              </Box>
              <FormControl
                size="small"
                sx={{ minWidth: 220, bgcolor: "white" }}
              >
                <Select
                  value={getDropdownValue(setting)}
                  onChange={(e) =>
                    handleChange(ctx.consumerId, ctx.contextId, e.target.value)
                  }
                >
                  <MenuItem value="FULL">配信する</MenuItem>
                  <MenuItem value="NONE">配信停止</MenuItem>
                </Select>
              </FormControl>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0", bgcolor: "#ffffff" }}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          disabled={!isDirty}
          onClick={handleSubmit}
        >
          更新
        </Button>
      </Box>
    </Box>
  );
}
