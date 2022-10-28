export { wrapStreamInText } from "./stream-utilities";

export { registerPiercingFragmentOutlet } from "./piercing-fragment-outlet";

import piercingFragmentHostInlineScriptRaw from "../dist/piercing-fragment-host-inline-script.js?raw";
export const piercingFragmentHostInlineScript = `<script>(() => {${piercingFragmentHostInlineScriptRaw}})();</script>`;

export { PiercingGateway } from "./piercing-gateway";
export type { FragmentConfig } from "./piercing-gateway";

export {
  getBus,
  createServerSideMessageBusFromRequest,
} from "./message-bus/message-bus";
import messageBusInlineScriptRaw from "../dist/message-bus-inline-script.js?raw";
export const getMessageBusInlineScript = (contextStr: string) =>
  `<script>(() => {${messageBusInlineScriptRaw.replace(
    /__MESSAGE_BUS_CONTEXT_STR_PLACEHOLDER__/g,
    contextStr.replace(/"/g, '\\"')
  )}})();</script>`;
