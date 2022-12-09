export { wrapStreamInText } from "./stream-utilities";

export { registerPiercingFragmentOutlet } from "./piercing-fragment-outlet";

export { PiercingFragmentHost } from "./piercing-fragment-host/piercing-fragment-host";
export { getFragmentHost } from "./piercing-fragment-host/get-fragment-host";
import piercingFragmentHostInlineScriptRaw from "../dist/piercing-fragment-host-inline-script.js?raw";
export const piercingFragmentHostInlineScript = `<script>(() => {${piercingFragmentHostInlineScriptRaw}})();</script>`;

export { PiercingGateway } from "./piercing-gateway";
export type { FragmentConfig } from "./piercing-gateway";

export { getBus } from "./message-bus/get-bus";
export { initializeServerSideMessageBus } from "./message-bus/server-side-message-bus";
import messageBusInlineScriptRaw from "../dist/message-bus-inline-script.js?raw";
export const getMessageBusInlineScript = (stateStr: string) =>
  `<script>(() => {${messageBusInlineScriptRaw.replace(
    /__MESSAGE_BUS_STATE_STR_PLACEHOLDER__/g,
    JSON.stringify(stateStr)
  )}})();</script>`;
