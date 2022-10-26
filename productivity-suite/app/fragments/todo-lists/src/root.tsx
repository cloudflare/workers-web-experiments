import {
  component$,
  useClientEffect$,
  useEnvData,
  useMount$,
  useSignal,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { Todo, TodoList } from "shared";

import styles from "./root.css?inline";
import { dispatchSelectedListUpdated } from "./dispatchSelectedListUpdated";
import { TodoListsCarousel } from "./components/TodoListsCarousel";
import { getBus } from "piercing-library";

export const Root = component$(() => {
  useStylesScoped$(styles);

  const envCurrentUser: string = useEnvData("currentUser")!;
  const initialUserData: { todoLists: TodoList[] } = useEnvData("userData")!;
  const initialSelectedListName: string | null =
    useEnvData("selectedListName") ?? null;

  const state = useStore<{
    currentUser?: string;
    todoLists: TodoList[];
    idxOfSelectedList: number;
    selectedListName: string;
  }>({
    todoLists: [],
    idxOfSelectedList: 0,
    selectedListName: "",
  });

  useMount$(async () => {
    state.currentUser = envCurrentUser;
    state.todoLists = initialUserData.todoLists;
    if (initialSelectedListName) {
      const idx = state.todoLists.findIndex(
        ({ name }) => name === initialSelectedListName
      );
      state.idxOfSelectedList = idx !== -1 ? idx : 0;
    }
  });

  const ref = useSignal<Element>();

  useClientEffect$(() => {
    if (ref.value) {
      return getBus(ref.value).listen({
        eventName: "todos-updated",
        callback: ({
          listName,
          todos,
        }: {
          listName: string;
          todos: Todo[];
        }) => {
          const list = state.todoLists.find(({ name }) => name === listName);
          if (list) {
            list.todos = todos;
          }
        },
      });
    }
  });

  return (
    <div class="todo-lists-section" ref={ref}>
      {state.currentUser && state.todoLists.length && (
        <TodoListsCarousel
          currentUser={state.currentUser!}
          initialTodoLists={state.todoLists}
          initialIdxOfSelectedList={state.idxOfSelectedList}
          onDispatchSelectedListUpdated$={(listSelected: TodoList) =>
            dispatchSelectedListUpdated(ref.value!, listSelected)
          }
        />
      )}
    </div>
  );
});
