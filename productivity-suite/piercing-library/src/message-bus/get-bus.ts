import type { MessageBus } from "./message-bus";
import { messageBusProp } from "./message-bus-prop";

export function getBus(element?: Element): MessageBus {
  while (element) {
    if (hasMessageBus(element)) {
      return element[messageBusProp];
    }
    element = element.parentElement ?? undefined;
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
