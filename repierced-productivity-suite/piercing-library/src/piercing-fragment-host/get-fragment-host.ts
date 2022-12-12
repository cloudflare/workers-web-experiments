import { messageBusProp } from "../message-bus/message-bus-prop";
import { PiercingFragmentHost } from "./piercing-fragment-host";

/**
 * Get the nearest fragment host ancestor to the given `element` or `null` if there is none.
 *
 * @param element Element from where to start looking for the fragment host (up the DOM tree)
 * @returns       The nearest fragment host ancestor or `null` if there is none.
 */
export function getFragmentHost(element: Element): PiercingFragmentHost | null {
  let current: Element | null = element;
  while (current) {
    if (isPiercingFragmentHost(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

function isPiercingFragmentHost(obj: Element): obj is PiercingFragmentHost {
  return !!obj && messageBusProp in obj;
}
