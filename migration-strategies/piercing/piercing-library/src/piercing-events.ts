export const piercingEventType = "piercing-event-type";

/**
 * The structure of piercing events.
 */
export type PiercingEvent = {
  /**
   * The user defined type for piercing events.
   */
  type: string;
  /**
   * Optional payload/data associated to the event.
   */
  payload?: any;
};

/**
 * Dispatches a piercing event.
 *
 * @param sourceElement Element from which the event is dispatched from
 *                      (it needs to be a DOM element within the fragment)
 * @param event piercing event to dispatch
 */
export function dispatchPiercingEvent(
  sourceElement: Element,
  event: PiercingEvent
) {
  const customEvent = new CustomEvent(piercingEventType, {
    detail: { ...event },
    bubbles: true,
  });
  sourceElement.dispatchEvent(customEvent);
}
