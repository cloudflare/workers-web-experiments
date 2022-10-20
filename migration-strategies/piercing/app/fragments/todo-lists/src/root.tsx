import {
  $,
  component$,
  useEnvData,
  useMount$,
  useRef,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { addTodoList, editTodoList, removeTodoList, Todo } from "shared";
import { dispatchSelectedListUpdated } from "./dispatchSelectedListUpdated";
import { getNewListName } from "./getNewListName";

import styles from "./root.css?inline";

export const Root = component$(() => {
  useStylesScoped$(styles);

  const envCurrentUser: string = useEnvData("currentUser")!;
  const initialUserData: { todoLists: { name: string; todos: Todo[] }[] } =
    useEnvData("userData")!;
  const initialSelectedListName: string | null =
    useEnvData("selectedListName") ?? null;

  const newTodoInputState = useStore<{
    value: string | null;
    valid: boolean;
    dirty: boolean;
  }>({
    value: null,
    valid: false,
    dirty: false,
  });

  const state = useStore<{
    currentUser?: string;
    todoLists: { name: string; todos: any[] }[];
    idxOfSelectedList: number;
    editingSelectedList: boolean;
  }>(
    {
      todoLists: [],
      idxOfSelectedList: 0,
      editingSelectedList: false,
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
      const newTodoListIdx = state.todoLists.length - 1;
      setTimeout(() => {
        animationState.animating = false;
        state.idxOfSelectedList = newTodoListIdx;
      }, animationDuration);
      dispatchSelectedListUpdated(
        ref.current!,
        state.todoLists[newTodoListIdx],
        "next"
      );
    }
  });

  const goToList = $((which: "previous" | "next") => {
    animationState.animating = true;
    animationState.currentAnimation = which;
    const newTodoListIdx =
      state.idxOfSelectedList + (which === "previous" ? -1 : 1);
    setTimeout(() => {
      animationState.animating = false;
      state.idxOfSelectedList = newTodoListIdx;
    }, animationDuration);
    dispatchSelectedListUpdated(
      ref.current!,
      state.todoLists[newTodoListIdx],
      which
    );
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
          class="todo-list-card selected-list-wrapper"
          onClick$={() => {
            if (!state.editingSelectedList) {
              state.editingSelectedList = true;
              newTodoInputState.value =
                state.todoLists[state.idxOfSelectedList].name;
              newTodoInputState.valid = true;
              newTodoInputState.dirty = false;
            }
          }}
        >
          <button class="todo-list-card selected-list">
            {!state.editingSelectedList && (
              <span>{state.todoLists[state.idxOfSelectedList].name}</span>
            )}
            {state.editingSelectedList && (
              <input
                ref={editRef}
                type="text"
                class={`selected-list-edit ${
                  newTodoInputState.valid ? "" : "invalid"
                }`}
                value={newTodoInputState.value ?? undefined}
                onInput$={(event: any) => {
                  const value = event.target.value;
                  newTodoInputState.value = value;
                  newTodoInputState.dirty = true;
                  const trimmedValue = value.trim();
                  if (
                    trimmedValue ===
                    state.todoLists[state.idxOfSelectedList].name
                  ) {
                    newTodoInputState.valid = true;
                    return;
                  }
                  if (
                    !trimmedValue ||
                    trimmedValue.length > 20 ||
                    !!state.todoLists.find(({ name }) => name === trimmedValue)
                  ) {
                    newTodoInputState.valid = false;
                    return;
                  }
                  newTodoInputState.valid = true;
                }}
                onBlur$={() => {
                  state.editingSelectedList = false;
                }}
                onKeyUp$={async (event: any) => {
                  if (
                    event.key === "Enter" &&
                    newTodoInputState.dirty &&
                    newTodoInputState.valid
                  ) {
                    const oldListName =
                      state.todoLists[state.idxOfSelectedList].name;
                    const newListName = newTodoInputState.value!.trim();
                    const success = await editTodoList(
                      state.currentUser!,
                      oldListName,
                      newListName
                    );
                    if (success) {
                      state.todoLists[state.idxOfSelectedList].name =
                        newListName;
                      state.editingSelectedList = false;
                      dispatchSelectedListUpdated(
                        ref.current!,
                        state.todoLists[state.idxOfSelectedList]
                      );
                    }
                  }
                }}
              />
            )}
          </button>
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
                dispatchSelectedListUpdated(
                  ref.current!,
                  state.todoLists[state.idxOfSelectedList]
                );
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
