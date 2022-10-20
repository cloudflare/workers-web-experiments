import {
  $,
  component$,
  useEnvData,
  useMount$,
  useRef,
  useStore,
  useStyles$,
  useStylesScoped$,
  useWatch$,
} from "@builder.io/qwik";
import { dispatchPiercingEvent } from "piercing-library";
import { addTodoList, editTodoList, removeTodoList, Todo } from "shared";
import { SelectedListCard } from "./components/SelectedListCard";

import styles from "./root.css?inline";
import listsAnimationStyles from "./listsAnimation.css?inline";
import { getNewListName } from "./getNewListName";
import { dispatchSelectedListUpdated } from "./dispatchSelectedListUpdated";

export const Root = component$(() => {
  useStylesScoped$(styles);
  useStyles$(listsAnimationStyles);

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
  }>(
    {
      todoLists: [],
      idxOfSelectedList: 0,
      selectedListName: "",
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

  useWatch$(({ track }) => {
    const idx = track(() => state.idxOfSelectedList);
    state.selectedListName = state.todoLists[idx].name;
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
        <SelectedListCard
          listName={state.selectedListName}
          todoListsNames={state.todoLists.map(({ name }) => name)}
          onEditListName$={async (newListName: string) => {
            const success = await editTodoList(
              state.currentUser!,
              state.selectedListName,
              newListName
            );
            if (success) {
              state.selectedListName = newListName;
              state.todoLists[state.idxOfSelectedList].name = newListName;
              dispatchSelectedListUpdated(
                ref.current!,
                state.todoLists[state.idxOfSelectedList]
              );
            }
            return success;
          }}
          onDeleteList$={async () => {
            const success = await removeTodoList(
              state.currentUser!,
              state.selectedListName
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
          }}
        />
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
