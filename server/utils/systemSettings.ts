import { validateZoomSettings } from "$server/utils/zoom/env";
import { validateWowzaSettings } from "$server/utils/wowza/env";

export function getSystemSettings() {
  return {
    zoomImportEnabled: validateZoomSettings(false),
    wowzaUploadEnabled: validateWowzaSettings(false),
  };
}
