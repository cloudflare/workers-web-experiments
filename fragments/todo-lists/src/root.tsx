import {
  component$,
  useEnvData,
  useMount$,
  useRef,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { dispatchPiercingEvent } from "piercing-lib";
import { addTodoList, removeTodoList } from "./api";

import styles from "./root.css?inline";

export const Root = component$(() => {
  useStylesScoped$(styles);
  const ref = useRef();

  const envCurrentUser: string = useEnvData("currentUser")!;
  const initialUserData: { todoLists: { name: string; todos: any[] }[] } =
    useEnvData("userData")!;
  const initialListName: string | null = useEnvData("listName") ?? null;

  const state = useStore<{
    currentUser?: string;
    lists: { name: string; todos: any[] }[];
    newListName: string;
    selectedList: string | null;
  }>({
    lists: [],
    newListName: "",
    selectedList: null,
  });

  useMount$(() => {
    state.currentUser = envCurrentUser;
    state.lists = initialUserData.todoLists;
    state.selectedList = initialListName;
  });

  return (
    <aside ref={ref}>
      <h3>Your Lists:</h3>
      <ul>
        {state.lists.map((list) => (
          <li key={list.name}>
            <button
              onClick$={() => {
                dispatchPiercingEvent(ref.current!, {
                  type: "todo-list-click",
                  payload: { list },
                });
                state.selectedList = list.name;
              }}
              class={state.selectedList === list.name ? "selected-list" : ""}
            >
              {list.name}
            </button>
            <button
              onClick$={async () => {
                const success = await removeTodoList(
                  state.currentUser!,
                  list.name
                );
                if (success) {
                  state.lists = state.lists.filter(
                    ({ name }) => name !== list.name
                  );
                }
              }}
            >
              x
            </button>
          </li>
        ))}
        <li>
          <form
            preventDefault:submit
            onSubmit$={async () => {
              const success = await addTodoList(
                state.currentUser!,
                state.newListName
              );
              if (success) {
                state.lists = [
                  ...state.lists,
                  { name: state.newListName, todos: [] },
                ];
                state.newListName = "";
              }
            }}
          >
            <input
              type="text"
              value={state.newListName}
              onInput$={(event) => {
                state.newListName = (event.target as HTMLInputElement).value;
              }}
            />
            <button disabled={!state.newListName}>Add</button>
          </form>
        </li>
      </ul>
    </aside>
  );
});
