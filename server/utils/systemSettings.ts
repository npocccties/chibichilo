import { validateZoomSettings } from "$server/utils/zoom/env";
import { validateWowzaSettings } from "$server/utils/wowza/env";
import { DASHBOARD_DISPLAY_LEVEL } from "./env";

export function getSystemSettings() {
  return {
    zoomImportEnabled: validateZoomSettings(false),
    wowzaUploadEnabled: validateWowzaSettings(false),
    dashboardDisplayLevel: DASHBOARD_DISPLAY_LEVEL,
  };
}
