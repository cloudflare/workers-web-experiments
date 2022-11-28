import { getFragmentHost } from "../piercing-fragment-host/get-fragment-host";
import { GenericMessageBus, type MessageBus } from "./message-bus";
import { messageBusProp } from "./message-bus-prop";

/**
 * Gets a `MessageBus` based on the provided element.
 *
 * Search up the ancestors of the given `element` looking for a `FragmentHost`.
 * If there is one then return the `MessageBus` attached to that.
 *
 * If there is no `FragmentHost` ancestor or `element` is not provided then
 * the global scope `MessageBus` is returned.
 *
 * @param element Element from where to start looking for a message bus (up the DOM tree).
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
  console.warn("No global message bus defined - creating an empty one.");

  return ((globalThis as unknown as { [messageBusProp]?: GenericMessageBus })[
    messageBusProp
  ] = new GenericMessageBus());
}

/**
 * Is the given `obj` a `MessageBus` container?
 *
 * Use this guard to narrow the type of `obj` to access the message bus property.
 */
function hasMessageBus<T>(obj: T): obj is T & { [messageBusProp]: MessageBus } {
  return !!obj && messageBusProp in obj;
}
