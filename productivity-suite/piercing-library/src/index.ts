export { wrapStreamInText } from "./stream-utilities";

export { registerPiercingFragmentOutlet } from "./piercing-fragment-outlet";

import piercingFragmentHostInlineScriptRaw from "../dist/piercing-fragment-host-inline-script.js?raw";
export const piercingFragmentHostInlineScript = `<script>(() => {${piercingFragmentHostInlineScriptRaw}})();</script>`;

export { PiercingGateway } from "./piercing-gateway";
export type { FragmentConfig } from "./piercing-gateway";

export { getBus } from "./message-bus";
