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

  const state = useStore<{
    currentUser?: string;
    lists: string[];
    newListName: string;
  }>({
    lists: [],
    newListName: "",
  });

  useMount$(() => {
    state.currentUser = envCurrentUser;
    state.lists = initialUserData.todoLists.map(({ name }) => name);
  });

  return (
    <aside ref={ref}>
      <h3>Your Lists:</h3>
      <ul>
        {state.lists.map((listName) => (
          <li key={listName}>
            <button
              onClick$={() => {
                dispatchPiercingEvent(ref.current!, {
                  type: "todo-list-click",
                  payload: { listName },
                });
              }}
            >
              {listName}
            </button>
            <button
              onClick$={async () => {
                const success = await removeTodoList(
                  state.currentUser!,
                  listName
                );
                if (success) {
                  state.lists = state.lists.filter((list) => list !== listName);
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
                state.lists = [...state.lists, state.newListName];
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
