import {
  $,
  component$,
  PropFunction,
  useStore,
  useStyles$,
  useStylesScoped$,
  useWatch$,
} from "@builder.io/qwik";
import { addTodoList, editTodoList, removeTodoList, Todo } from "shared";
import { getNewListName } from "../getNewListName";
import { SelectedListCard } from "./SelectedListCard";

import styles from "./TodoListsCarousel.css?inline";
import listsAnimationStyles from "./listsAnimation.css?inline";

export const TodoListsCarousel = component$(
  ({
    currentUser,
    initialTodoLists,
    initialIdxOfSelectedList,
    onDispatchSelectedListUpdated$,
  }: {
    currentUser: string;
    initialTodoLists: { name: string; todos: Todo[] }[];
    initialIdxOfSelectedList: number;
    onDispatchSelectedListUpdated$: PropFunction<
      (
        listSelected: { name: string; todos: any[] },
        which?: "previous" | "next"
      ) => void
    >;
  }) => {
    useStylesScoped$(styles);
    useStyles$(listsAnimationStyles);

    const state = useStore<{
      todoLists: { name: string; todos: any[] }[];
      idxOfSelectedList: number;
      selectedListName: string;
    }>(
      {
        todoLists: initialTodoLists,
        idxOfSelectedList: initialIdxOfSelectedList,
        selectedListName: initialTodoLists[initialIdxOfSelectedList].name,
      },
      { recursive: true }
    );

    const animationState = useStore<{
      animating: boolean;
      currentAnimation: "previous" | "next" | null;
    }>({ animating: false, currentAnimation: null });

    const animationDuration = 150;

    const addNewList = $(async () => {
      const newListName = getNewListName(state.todoLists);
      const success = await addTodoList(currentUser, newListName);
      if (success) {
        animationState.animating = true;
        state.todoLists.push({ name: newListName, todos: [] });
        animationState.currentAnimation = "next";
        const newTodoListIdx = state.todoLists.length - 1;
        setTimeout(() => {
          animationState.animating = false;
          state.idxOfSelectedList = newTodoListIdx;
        }, animationDuration);
        onDispatchSelectedListUpdated$(state.todoLists[newTodoListIdx], "next");
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
      onDispatchSelectedListUpdated$(state.todoLists[newTodoListIdx], which);
    });

    useWatch$(({ track }) => {
      const idx = track(() => state.idxOfSelectedList);
      state.selectedListName = state.todoLists[idx].name;
    });

    return (
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
              currentUser,
              state.selectedListName,
              newListName
            );
            if (success) {
              state.selectedListName = newListName;
              state.todoLists[state.idxOfSelectedList].name = newListName;
              onDispatchSelectedListUpdated$(
                state.todoLists[state.idxOfSelectedList]
              );
            }
            return success;
          }}
          onDeleteList$={async () => {
            const success = await removeTodoList(
              currentUser,
              state.selectedListName
            );
            if (success) {
              state.todoLists = state.todoLists
                .slice(0, state.idxOfSelectedList)
                .concat(state.todoLists.slice(state.idxOfSelectedList + 1));
              if (state.idxOfSelectedList > 0) {
                state.idxOfSelectedList--;
              }
              onDispatchSelectedListUpdated$(
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
    );
  }
);
