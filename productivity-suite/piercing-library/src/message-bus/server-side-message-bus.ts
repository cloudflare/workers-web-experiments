import { GenericMessageBus } from "./message-bus";
import { messageBusProp } from "./message-bus-prop";

export class ServerSideMessageBus extends GenericMessageBus {}

export function getMessageBusStateFromRequest(request: Request) {
  const stateHeaderStr = request.headers.get("message-bus-state");
  return JSON.parse(stateHeaderStr ?? "{}");
}

export function createServerSideMessageBusFromRequest(request: Request) {
  const state = getMessageBusStateFromRequest(request);
  (globalThis as any as { [messageBusProp]?: ServerSideMessageBus })[
    messageBusProp
  ] = new ServerSideMessageBus(state);
}
