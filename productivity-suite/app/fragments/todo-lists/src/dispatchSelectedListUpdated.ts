import { getBus } from "piercing-library";

export function dispatchSelectedListUpdated(el: Element, listName: string) {
  getBus(el).dispatch("todo-list-selected", {
    name: listName,
  });
}
