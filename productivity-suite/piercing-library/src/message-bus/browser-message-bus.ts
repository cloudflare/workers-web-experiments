import { GenericMessageBus } from "./message-bus";
import { messageBusProp } from "./message-bus-prop";

export class BrowserMessageBus extends GenericMessageBus {}

export function createBrowserMessageBusFromStateStr(stateStr: string) {
  const state = JSON.parse(stateStr ?? "{}");
  (globalThis as any as { [messageBusProp]?: BrowserMessageBus })[
    messageBusProp
  ] = new BrowserMessageBus(state);
}
