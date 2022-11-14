import { GenericMessageBus } from "./message-bus";
import { messageBusProp } from "./message-bus-prop";

declare const __MESSAGE_BUS_STATE_STR_PLACEHOLDER__: string;

const state = JSON.parse(__MESSAGE_BUS_STATE_STR_PLACEHOLDER__ ?? "{}");
(globalThis as unknown as { [messageBusProp]?: GenericMessageBus })[
  messageBusProp
] = new GenericMessageBus(state);
