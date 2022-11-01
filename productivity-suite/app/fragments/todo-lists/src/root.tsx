import {
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
import { dispatchSelectedListUpdated } from "./dispatchSelectedListUpdated";
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
    const currentUser = await Promise.race([
      new Promise<string | null>((resolve) => {
        getBus(null).listen({
          eventName: "authentication",
          callback: ({ username }: { username: string }) => {
            resolve(username);
          },
          options: {
            once: true,
          },
        });
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
    ]);

    state.currentUser = currentUser ?? undefined;

    const todoLists = currentUser
      ? await getTodoLists(currentUser, requestCookie)
      : null;
    state.todoLists = todoLists ?? [];

    const selectedListName = await Promise.race([
      new Promise<string | null>((resolve) => {
        getBus(null).listen({
          eventName: "todo-list-selected",
          callback: ({ name }: { name: string }) => {
            resolve(name);
          },
          options: {
            once: true,
          },
        });
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
    ]);

    const idx = state.todoLists.findIndex(
      ({ name }) => name === selectedListName
    );

    state.idxOfSelectedList = idx !== -1 ? idx : state.todoLists.length - 1;
    state.selectedListName = state.todoLists[idx]!.name;
  });

  const ref = useSignal<Element>();

  useClientEffect$(() => {
    if (ref.value) {
      getBus(ref.value).listen({
        eventName: "todo-list-selected",
        callback: ({ name }: { name: string }) => {
          const newIdxOfSelectedList = state.todoLists.findIndex(
            ({ name: listName }) => listName === name
          );
          if (newIdxOfSelectedList >= 0) {
            state.idxOfSelectedList = newIdxOfSelectedList;
            state.selectedListName = state.todoLists[newIdxOfSelectedList].name;
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
  );
});
