export type { PiercingEvent } from "./piercing-events";

export { wrapStreamInText } from "./stream-utilities";

export { dispatchPiercingEvent } from "./piercing-events";

export { registerPiercingFragmentOutlet } from "./piercing-fragment-outlet";

import piercingFragmentHostInlineScriptRaw from "../dist/piercing-fragment-host-inline-script.js?raw";
export const piercingFragmentHostInlineScript = `<script>(() => {${piercingFragmentHostInlineScriptRaw}})();</script>`;

export { PiercingGateway } from "./piercing-gateway";
