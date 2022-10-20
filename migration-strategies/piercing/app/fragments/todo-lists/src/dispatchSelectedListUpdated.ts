import { dispatchPiercingEvent } from "piercing-library";

export function dispatchSelectedListUpdated(
  el: Element,
  listSelected: { name: string; todos: any[] },
  which?: "previous" | "next"
) {
  dispatchPiercingEvent(el, {
    type: "todo-list-selected",
    payload: {
      list: listSelected,
      which,
    },
  });
}
