import { getFragmentHost } from "../piercing-fragment-host/get-fragment-host";
import type { MessageBus } from "./message-bus";
import { messageBusProp } from "./message-bus-prop";

/**
 * Gets a message bus based on the provided element.
 *
 * @param element Element from where to start looking for a message bus (up the DOM tree)
 *                if there is no intermediate message bus or the element is not provided
 *                the message bus in the global scope is returned.
 * @returns       The most relevant message bus.
 */
export function getBus(element?: Element): MessageBus {
  if (element) {
    const fragmentHost = getFragmentHost(element);
    if (fragmentHost) {
      return fragmentHost[messageBusProp];
    }
  }
  const root = globalThis;
  if (hasMessageBus(root)) {
    return root[messageBusProp];
  }
  throw new Error("No global message bus defined!");
}

function hasMessageBus<T>(obj: T): obj is T & { [messageBusProp]: MessageBus } {
  return !!obj && messageBusProp in obj;
}
