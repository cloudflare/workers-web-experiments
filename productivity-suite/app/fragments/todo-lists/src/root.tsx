import {
  $,
  component$,
  useClientEffect$,
  useEnvData,
  useServerMount$,
  useSignal,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { getTodoLists, TodoList } from "shared";

import styles from "./root.css?inline";
import { TodoListsCarousel } from "./components/TodoListsCarousel";
import { getBus } from "piercing-library";

export const Root = component$(() => {
  useStylesScoped$(styles);

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

  const requestCookie: string = useEnvData("requestCookie")!;

  useServerMount$(async () => {
    const currentUser =
      getBus().latestValue<{ username: string }>("authentication")?.username ??
      null;

    state.currentUser = currentUser ?? undefined;

    const todoLists = currentUser
      ? await getTodoLists(currentUser, requestCookie)
      : null;
    state.todoLists = todoLists ?? [];

    const selectedListName =
      getBus().latestValue<{ name: string }>("todo-list-selected")?.name ??
      null;

    const idx = state.todoLists.findIndex(
      ({ name }) => name === selectedListName
    );

    state.idxOfSelectedList = idx !== -1 ? idx : state.todoLists.length - 1;
    state.selectedListName = state.todoLists[idx].name;
  });

  const ref = useSignal<Element>();

  useClientEffect$(
    () => {
      if (ref.value) {
        getBus(ref.value).listen<{ name: string }>(
          "todo-list-selected",
          (listDetails) => {
            const newIdxOfSelectedList = state.todoLists.findIndex(
              ({ name }) => name === listDetails?.name
            );
            if (newIdxOfSelectedList >= 0) {
              state.idxOfSelectedList = newIdxOfSelectedList;
              state.selectedListName =
                state.todoLists[newIdxOfSelectedList].name;
            }
          }
        );
      }
    },
    // Qwik doesn't trigger `useClientEffect$`s in certain scenarios
    // so we need to add this flag and also emit a qinit events after
    // adding/moving qwik fragments.
    // (for more info see: https://github.com/BuilderIO/qwik/issues/1947)
    { eagerness: "load" }
  );

  const dispatchSelectedListUpdated = $((el: Element, name: string) =>
    getBus(el).dispatch("todo-list-selected", { name })
  );

  return (
    <div class="todo-lists-section-wrapper">
      <div class="todo-lists-section" ref={ref}>
        {state.currentUser && state.todoLists.length && (
          <TodoListsCarousel
            currentUser={state.currentUser!}
            initialTodoLists={state.todoLists}
            idxOfSelectedList={state.idxOfSelectedList}
            selectedListName={state.selectedListName}
            onUpdateSelectedListDetails$={({
              idx,
              name,
            }: {
              idx: number;
              name: string;
            }) => {
              state.idxOfSelectedList = idx;
              state.selectedListName = name;
            }}
            onDispatchSelectedListUpdated$={(listSelected: TodoList) =>
              dispatchSelectedListUpdated(ref.value!, listSelected.name)
            }
          />
        )}
      </div>
    </div>
  );
});
