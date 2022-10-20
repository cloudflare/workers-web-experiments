import { $ } from "@builder.io/qwik";
import { dispatchPiercingEvent } from "piercing-library";

export const dispatchSelectedListUpdated = $(
  (
    el: Element,
    listSelected: { name: string; todos: any[] },
    which?: "previous" | "next"
  ) => {
    dispatchPiercingEvent(el, {
      type: "todo-list-selected",
      payload: {
        list: listSelected,
        which,
      },
    });
  }
);
