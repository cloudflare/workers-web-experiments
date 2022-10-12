export const piercingEventType = "piercing-event-type";

export type PiercingEvent = {
  type: string;
  payload?: any;
};

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
