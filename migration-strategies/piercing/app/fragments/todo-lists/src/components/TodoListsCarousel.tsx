import {
  $,
  component$,
  PropFunction,
  useStore,
  useStyles$,
  useStylesScoped$,
  useWatch$,
} from "@builder.io/qwik";
import { addTodoList, editTodoList, removeTodoList } from "shared";
import type { Todo, TodoList } from "shared";
import { getNewListName } from "../getNewListName";
import { SelectedListCard } from "./SelectedListCard";

import styles from "./TodoListsCarousel.css?inline";
import listsAnimationStyles from "./ListsAnimation.css?inline";
import { TodoListsCarouselPreviousSection } from "./TodoListsCarouselPreviousSection";
import { TodoListsCarouselNextSection } from "./TodoListsCarouselNextSection";

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
      (listSelected: TodoList, which?: "previous" | "next") => void
    >;
  }) => {
    useStylesScoped$(styles);
    useStyles$(listsAnimationStyles);

    const state = useStore<{
      todoLists: TodoList[];
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
        <TodoListsCarouselPreviousSection
          previousHidden={state.idxOfSelectedList === 0}
          previousDisabled={
            state.idxOfSelectedList === 0 || animationState.animating
          }
          onGoToPrevious$={() => goToList("previous")}
          previousListName={
            state.idxOfSelectedList > 0
              ? state.todoLists[state.idxOfSelectedList - 1].name
              : null
          }
          previousPreviousListName={
            state.idxOfSelectedList > 1
              ? state.todoLists[state.idxOfSelectedList - 2].name
              : null
          }
        />
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
        <TodoListsCarouselNextSection
          nextHidden={state.idxOfSelectedList === state.todoLists.length - 1}
          nextDisabled={animationState.animating}
          onGoToNext$={() => goToList("next")}
          nextListName={
            state.idxOfSelectedList < state.todoLists.length - 1
              ? state.todoLists[state.idxOfSelectedList + 1].name
              : null
          }
          nextNextListName={
            state.idxOfSelectedList <= state.todoLists.length - 3
              ? state.todoLists[state.idxOfSelectedList + 2].name
              : null
          }
          onAddNewList$={addNewList}
        />
      </div>
    );
  }
);
