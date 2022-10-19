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

  const animationState = useStore<{
    animating: boolean;
    currentAnimation: "previous" | "next" | null;
  }>({ animating: false, currentAnimation: null });

  const animationDuration = 150;

  const addNewList = $(async () => {
    const newListName = await getNewListName(state.todoLists);
    const success = await addTodoList(state.currentUser!, newListName);
    if (success) {
      animationState.animating = true;
      state.todoLists.push({ name: newListName, todos: [] });
      animationState.currentAnimation = "next";
      setTimeout(() => {
        animationState.animating = false;
        state.idxOfSelectedList = state.todoLists.length - 1;
      }, animationDuration);
      dispatchSelectedListUpdated();
    }
  });

  const goToList = $((which: "previous" | "next") => {
    animationState.animating = true;
    animationState.currentAnimation = which;
    setTimeout(() => {
      animationState.animating = false;
      state.idxOfSelectedList += which === "previous" ? -1 : 1;
    }, animationDuration);
    dispatchSelectedListUpdated();
  });

  return (
    <div class="todo-lists-section" ref={ref}>
      <div
        class={`todo-lists-carousel ${
          animationState.animating
            ? `animating-${animationState.currentAnimation}`
            : ""
        }`}
      >
        <button
          disabled={state.idxOfSelectedList === 0 || animationState.animating}
          class={`btn nav-btn left ${
            state.idxOfSelectedList === 0 ? "hidden" : ""
          }`}
          onClick$={() => goToList("previous")}
        >
          &lt;
        </button>
        {state.idxOfSelectedList > 1 && (
          <div class={"todo-list-card previous-previous-list"}>
            {state.todoLists[state.idxOfSelectedList - 2].name}
          </div>
        )}
        <button
          class={`todo-list-card previous-list ${
            state.idxOfSelectedList === 0 ? "hidden" : ""
          }`}
          disabled={animationState.animating}
          onClick$={() => goToList("previous")}
        >
          {state.idxOfSelectedList > 0 &&
            state.todoLists[state.idxOfSelectedList - 1].name}
        </button>
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
        {state.idxOfSelectedList < state.todoLists.length - 1 && (
          <button
            class={`todo-list-card next-list ${
              state.idxOfSelectedList === state.todoLists.length - 1
                ? "hidden"
                : ""
            }`}
            disabled={animationState.animating}
            onClick$={() => goToList("next")}
          >
            {state.idxOfSelectedList < state.todoLists.length - 1 &&
              state.todoLists[state.idxOfSelectedList + 1].name}
          </button>
        )}
        {state.idxOfSelectedList === state.todoLists.length - 1 && (
          <button
            class={`todo-list-card next-list add-btn`}
            disabled={animationState.animating}
            onClick$={addNewList}
          >
            Add List
          </button>
        )}
        <div
          class={`todo-list-card next-next-list ${
            state.idxOfSelectedList >= state.todoLists.length - 2
              ? "add-btn"
              : ""
          }`}
        >
          {state.idxOfSelectedList <= state.todoLists.length - 3
            ? state.todoLists[state.idxOfSelectedList + 2].name
            : "Add List"}
        </div>
        {state.idxOfSelectedList !== state.todoLists.length - 1 ? (
          <button
            disabled={
              state.idxOfSelectedList === state.todoLists.length - 1 ||
              animationState.animating
            }
            class={`btn nav-btn right ${
              state.idxOfSelectedList === state.todoLists.length - 1
                ? "hidden"
                : ""
            }`}
            onClick$={() => goToList("next")}
          >
            &gt;
          </button>
        ) : (
          <button
            class="btn nav-btn right"
            onClick$={addNewList}
            disabled={animationState.animating}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
});
