import { dispatchPiercingEvent } from "piercing-library";
import type { TodoList } from "shared";

export function dispatchSelectedListUpdated(
  el: Element,
  listSelected: TodoList,
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
