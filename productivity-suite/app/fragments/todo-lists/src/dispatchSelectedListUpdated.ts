import { getBus } from "piercing-library";
import type { TodoList } from "shared";

export function dispatchSelectedListUpdated(
  el: Element,
  listSelected: TodoList
) {
  getBus(el).dispatch("todo-list-selected", {
    list: listSelected,
  });
}
