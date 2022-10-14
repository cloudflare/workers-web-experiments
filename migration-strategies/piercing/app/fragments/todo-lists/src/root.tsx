import {
  $,
  component$,
  useEnvData,
  useMount$,
  useRef,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { dispatchPiercingEvent } from "piercing-library";
import { addTodoList, removeTodoList } from "./api";

import styles from "./root.css?inline";

export const getNewListName = $((lists: { name: string; todos: any[] }[]) => {
  const newListAlreadyPresent = !!lists.find(({ name }) => name === "new list");
  let newListSuffix = 0;
  if (newListAlreadyPresent) {
    do {
      newListSuffix++;
      const alreadyTaken = lists.find(
        ({ name }) => name === `new list ${newListSuffix}`
      );
      if (!alreadyTaken) break;
    } while (newListSuffix < 8);
  }
  const newListName = `new list${!newListSuffix ? "" : ` ${newListSuffix}`}`;

  return newListName;
});

export const Root = component$(() => {
  useStylesScoped$(styles);
  const ref = useRef();

  const envCurrentUser: string = useEnvData("currentUser")!;
  const initialUserData: { todoLists: { name: string; todos: any[] }[] } =
    useEnvData("userData")!;
  const initialSelectedListName: string | null =
    useEnvData("selectedListName") ?? null;

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

  useMount$(async () => {
    state.currentUser = envCurrentUser;
    state.lists = initialUserData.todoLists;
    state.selectedList = initialSelectedListName;
  });

  return (
    <div class="list-cards-wrapper" ref={ref}>
      <button
        disabled={state.lists.length > 7}
        class="list-card add-new-list-btn"
        onClick$={async () => {
          const newListName = await getNewListName(state.lists);
          const success = await addTodoList(state.currentUser!, newListName);
          if (success) {
            state.lists = [...state.lists, { name: newListName, todos: [] }];
          }
        }}
      >
        +
      </button>
      {state.lists.map((list) => (
        <label class="list-card" key={list.name}>
          {list.name}
          <input
            type="radio"
            name="todo-list"
            value={list.name}
            checked={list.name === state.selectedList}
            onChange$={(event: any) => {
              dispatchPiercingEvent(ref.current!, {
                type: "todo-list-selected",
                payload: { list },
              });
              state.selectedList = event.target.value;
            }}
          />
        </label>
      ))}
    </div>
  );
});
