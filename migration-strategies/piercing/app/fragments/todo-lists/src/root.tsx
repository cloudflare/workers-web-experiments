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
import { addTodoList, editTodoList, removeTodoList, Todo } from "shared";

import styles from "./root.css?inline";

export const getNewListName = $((lists: { name: string; todos: any[] }[]) => {
  const newListAlreadyPresent = !!lists.find(({ name }) => name === "new list");
  let newListSuffix = 0;
  let matchFound = false;
  if (newListAlreadyPresent) {
    do {
      newListSuffix++;
      const alreadyTaken = lists.find(
        ({ name }) => name === `new list ${newListSuffix}`
      );
      if (!alreadyTaken) matchFound = true;
    } while (!matchFound);
  }

  const newListName = `new list${!newListSuffix ? "" : ` ${newListSuffix}`}`;

  return newListName;
});

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
    editingSelectedList: boolean;
    newNameForSelectedList: string | null;
    newNameForSelectedListIsInvalid: boolean;
  }>(
    {
      todoLists: [],
      idxOfSelectedList: 0,
      editingSelectedList: false,
      newNameForSelectedList: null,
      newNameForSelectedListIsInvalid: false,
    },
    { recursive: true }
  );

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
  const editRef = useRef<HTMLInputElement>();
  editRef.current?.focus();

  const dispatchSelectedListUpdated = $(() => {
    dispatchPiercingEvent(ref.current!, {
      type: "todo-list-selected",
      payload: {
        list: state.todoLists[state.idxOfSelectedList],
      },
    });
  });

  return (
    <div class="todo-lists-section" ref={ref}>
      <button
        class="btn add-btn"
        onClick$={async () => {
          const newListName = await getNewListName(state.todoLists);
          const success = await addTodoList(state.currentUser!, newListName);
          if (success) {
            state.todoLists.push({ name: newListName, todos: [] });
            state.idxOfSelectedList = state.todoLists.length - 1;
            dispatchSelectedListUpdated();
          }
        }}
      >
        Add List
      </button>
      <div class="todo-lists-carousel">
        <button
          disabled={state.idxOfSelectedList === 0}
          class="btn nav-btn left"
          onClick$={() => {
            state.idxOfSelectedList--;
            dispatchSelectedListUpdated();
          }}
        >
          &lt;
        </button>
        <div
          class={`todo-list-card previous-list ${
            state.idxOfSelectedList === 0 ? "hidden" : ""
          }`}
        >
          {state.idxOfSelectedList > 0 &&
            state.todoLists[state.idxOfSelectedList - 1].name}
        </div>
        <div
          class="todo-list-card selected-list"
          onClick$={() => {
            state.editingSelectedList = true;
            state.newNameForSelectedList =
              state.todoLists[state.idxOfSelectedList].name;
            state.newNameForSelectedListIsInvalid = false;
          }}
        >
          {!state.editingSelectedList && (
            <span>{state.todoLists[state.idxOfSelectedList].name}</span>
          )}
          {state.editingSelectedList && (
            <input
              ref={editRef}
              type="text"
              class={`selected-list-edit ${
                state.newNameForSelectedListIsInvalid ? "invalid" : ""
              }`}
              value={state.newNameForSelectedList ?? undefined}
              onInput$={(event: any) => {
                const value = event.target.value;
                state.newNameForSelectedList = value;
                const trimmedValue = value.trim();
                if (
                  trimmedValue === state.todoLists[state.idxOfSelectedList].name
                ) {
                  state.newNameForSelectedListIsInvalid = false;
                  return;
                }
                if (
                  !trimmedValue ||
                  trimmedValue.length > 20 ||
                  !!state.todoLists.find(({ name }) => name === trimmedValue)
                ) {
                  state.newNameForSelectedListIsInvalid = true;
                  return;
                }
                state.newNameForSelectedListIsInvalid = false;
              }}
              onBlur$={() => {
                state.editingSelectedList = false;
              }}
              onKeyUp$={async (event: any) => {
                if (
                  event.key === "Enter" &&
                  !state.newNameForSelectedListIsInvalid
                ) {
                  const oldListName =
                    state.todoLists[state.idxOfSelectedList].name;
                  const newListName = state.newNameForSelectedList!.trim();
                  const success = await editTodoList(
                    state.currentUser!,
                    oldListName,
                    newListName
                  );
                  if (success) {
                    state.todoLists[state.idxOfSelectedList].name = newListName;
                    state.editingSelectedList = false;
                    dispatchSelectedListUpdated();
                  }
                }
              }}
            />
          )}
          <button
            class="btn delete-btn"
            disabled={state.editingSelectedList || state.todoLists.length <= 1}
            onClick$={async (event) => {
              const success = await removeTodoList(
                state.currentUser!,
                state.todoLists[state.idxOfSelectedList].name
              );
              if (success) {
                state.todoLists = state.todoLists
                  .slice(0, state.idxOfSelectedList)
                  .concat(state.todoLists.slice(state.idxOfSelectedList + 1));
                if (state.idxOfSelectedList > 0) {
                  state.idxOfSelectedList--;
                }
                dispatchSelectedListUpdated();
              }
              event.stopPropagation();
            }}
          >
            x
          </button>
        </div>
        <div
          class={`todo-list-card next-list ${
            state.idxOfSelectedList === state.todoLists.length - 1
              ? "hidden"
              : ""
          }`}
        >
          {state.idxOfSelectedList < state.todoLists.length - 1 &&
            state.todoLists[state.idxOfSelectedList + 1].name}
        </div>
        <button
          disabled={state.idxOfSelectedList === state.todoLists.length - 1}
          class="btn nav-btn right"
          onClick$={() => {
            state.idxOfSelectedList++;
            dispatchSelectedListUpdated();
          }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
});
