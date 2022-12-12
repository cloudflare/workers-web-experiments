import { GenericMessageBus } from "./message-bus";
import { messageBusProp } from "./message-bus-prop";

export class ServerSideMessageBus extends GenericMessageBus {}

export function getMessageBusState(request: Request) {
  const stateHeaderStr = request.headers.get("message-bus-state");
  return JSON.parse(stateHeaderStr ?? "{}");
}

/**
 * Initializes a server side message bus for the current process based on the
 * received request (so that server side rendering elements can access the
 * message bus).
 *
 * @param request The received request.
 */
export function initializeServerSideMessageBus(request: Request) {
  const state = getMessageBusState(request);
  (globalThis as unknown as { [messageBusProp]?: ServerSideMessageBus })[
    messageBusProp
  ] = new ServerSideMessageBus(state);
}
