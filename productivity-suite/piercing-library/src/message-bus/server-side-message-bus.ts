import { GenericMessageBus } from "./message-bus";
import { messageBusProp } from "./message-bus-prop";

export class ServerSideMessageBus extends GenericMessageBus {}

export function getMessageBusState(request: Request) {
  const stateHeaderStr = request.headers.get("message-bus-state");
  return JSON.parse(stateHeaderStr ?? "{}");
}

export function initializeServerSideMessageBus(request: Request) {
  const state = getMessageBusState(request);
  (globalThis as any as { [messageBusProp]?: ServerSideMessageBus })[
    messageBusProp
  ] = new ServerSideMessageBus(state);
}
