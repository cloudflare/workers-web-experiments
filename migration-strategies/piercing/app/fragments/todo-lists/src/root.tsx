import {
  component$,
  useEnvData,
  useMount$,
  useRef,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { Todo } from "shared";

import styles from "./root.css?inline";
import { dispatchSelectedListUpdated } from "./dispatchSelectedListUpdated";
import { TodoListsCarousel } from "./components/TodoListsCarousel";

export const Root = component$(() => {
  useStylesScoped$(styles);

  const envCurrentUser: string = useEnvData("currentUser")!;
  const initialUserData: { todoLists: { name: string; todos: Todo[] }[] } =
    useEnvData("userData")!;
  const initialSelectedListName: string | null =
    useEnvData("selectedListName") ?? null;

  const state = useStore<{
    currentUser?: string;
    todoLists: { name: string; todos: any[] }[];
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

  const ref = useRef();

  return (
    <div class="todo-lists-section" ref={ref}>
      {state.currentUser && state.todoLists.length && (
        <TodoListsCarousel
          currentUser={state.currentUser!}
          initialTodoLists={state.todoLists}
          initialIdxOfSelectedList={state.idxOfSelectedList}
          onDispatchSelectedListUpdated$={(
            listSelected: { name: string; todos: any[] },
            which?: "previous" | "next"
          ) => dispatchSelectedListUpdated(ref.current!, listSelected, which)}
        />
      )}
    </div>
  );
});
