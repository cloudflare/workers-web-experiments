import {
  $,
  component$,
  PropFunction,
  useStore,
  useStyles$,
  useStylesScoped$,
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
    idxOfSelectedList,
    selectedListName,
    onUpdateSelectedListDetails$,
    onDispatchSelectedListUpdated$,
  }: {
    currentUser: string;
    initialTodoLists: { name: string; todos: Todo[] }[];
    idxOfSelectedList: number;
    selectedListName: string;
    onUpdateSelectedListDetails$: PropFunction<
      ({ idx, name }: { idx: number; name: string }) => void
    >;
    onDispatchSelectedListUpdated$: PropFunction<
      (listSelected: TodoList) => void
    >;
  }) => {
    useStylesScoped$(styles);
    useStyles$(listsAnimationStyles);

    const state = useStore<{
      todoLists: TodoList[];
    }>(
      {
        todoLists: initialTodoLists,
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
          onUpdateSelectedListDetails$({
            idx: newTodoListIdx,
            name: state.todoLists[newTodoListIdx].name,
          });
          onDispatchSelectedListUpdated$(state.todoLists[newTodoListIdx]);
        }, animationDuration);
      }
    });

    const goToList = $((which: "previous" | "next") => {
      animationState.animating = true;
      animationState.currentAnimation = which;
      const newTodoListIdx =
        idxOfSelectedList + (which === "previous" ? -1 : 1);
      setTimeout(() => {
        animationState.animating = false;
        onUpdateSelectedListDetails$({
          idx: newTodoListIdx,
          name: state.todoLists[newTodoListIdx].name,
        });
      }, animationDuration);
      onDispatchSelectedListUpdated$(state.todoLists[newTodoListIdx]);
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
          previousHidden={idxOfSelectedList === 0}
          previousDisabled={idxOfSelectedList === 0 || animationState.animating}
          onGoToPrevious$={() => goToList("previous")}
          previousListName={
            idxOfSelectedList > 0
              ? state.todoLists[idxOfSelectedList - 1].name
              : null
          }
          previousPreviousListName={
            idxOfSelectedList > 1
              ? state.todoLists[idxOfSelectedList - 2].name
              : null
          }
        />
        <SelectedListCard
          listName={selectedListName}
          todoListsNames={state.todoLists.map(({ name }) => name)}
          onEditListName$={async (newListName: string) => {
            const success = await editTodoList(
              currentUser,
              selectedListName,
              newListName
            );
            if (success) {
              state.todoLists[idxOfSelectedList].name = newListName;
              onUpdateSelectedListDetails$({
                idx: idxOfSelectedList,
                name: newListName,
              });
              onDispatchSelectedListUpdated$(
                state.todoLists[idxOfSelectedList]
              );
            }
            return success;
          }}
          onDeleteList$={async () => {
            const success = await removeTodoList(currentUser, selectedListName);
            if (success) {
              state.todoLists = state.todoLists
                .slice(0, idxOfSelectedList)
                .concat(state.todoLists.slice(idxOfSelectedList + 1));
              if (idxOfSelectedList > 0) {
                onUpdateSelectedListDetails$({
                  idx: idxOfSelectedList - 1,
                  name: state.todoLists[idxOfSelectedList].name,
                });
              }
              onDispatchSelectedListUpdated$(
                state.todoLists[idxOfSelectedList]
              );
            }
          }}
        />
        <TodoListsCarouselNextSection
          nextHidden={idxOfSelectedList === state.todoLists.length - 1}
          nextDisabled={animationState.animating}
          onGoToNext$={() => goToList("next")}
          nextListName={
            idxOfSelectedList < state.todoLists.length - 1
              ? state.todoLists[idxOfSelectedList + 1].name
              : null
          }
          nextNextListName={
            idxOfSelectedList <= state.todoLists.length - 3
              ? state.todoLists[idxOfSelectedList + 2].name
              : null
          }
          onAddNewList$={addNewList}
        />
      </div>
    );
  }
);
