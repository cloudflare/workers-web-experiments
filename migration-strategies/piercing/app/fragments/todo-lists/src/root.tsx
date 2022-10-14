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
import { addTodoList, editTodoList, removeTodoList } from "shared";

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
    editingSelectedList: boolean;
    newSelectedListName: string | null;
    newSelectedListNameIsValid: boolean;
  }>({
    lists: [],
    newListName: "",
    selectedList: null,
    editingSelectedList: false,
    newSelectedListName: null,
    newSelectedListNameIsValid: false,
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
        <div class="list-card" key={list.name}>
          <label
            onClick$={() => {
              if (state.selectedList === list.name) {
                state.editingSelectedList = true;
                state.newSelectedListName = list.name;
                state.newSelectedListNameIsValid = true;
              }
            }}
          >
            {list.name}
            <input
              type="radio"
              name="todo-list"
              value={list.name}
              checked={list.name === state.selectedList}
              onChange$={(event: any) => {
                setTimeout(() => {
                  dispatchPiercingEvent(ref.current!, {
                    type: "todo-list-selected",
                    payload: { list },
                  });
                  state.selectedList = event.target.value;
                });
              }}
            />
            {list.name === state.selectedList && (
              <button
                class="delete-btn"
                disabled={state.lists.length <= 1}
                onClick$={async () => {
                  const success = await removeTodoList(
                    state.currentUser!,
                    list.name
                  );
                  if (success) {
                    state.lists = state.lists.filter(
                      ({ name }) => name !== list.name
                    );
                    const selectedList = state.lists[state.lists.length - 1];
                    dispatchPiercingEvent(ref.current!, {
                      type: "todo-list-selected",
                      payload: { list: selectedList },
                    });
                    state.selectedList = selectedList.name;
                  }
                }}
              >
                x
              </button>
            )}
          </label>
          {list.name === state.selectedList && state.editingSelectedList && (
            <input
              type="text"
              className={`edit ${
                state.newSelectedListNameIsValid ? "" : "invalid"
              }`}
              autoFocus
              value={state.selectedList!}
              onInput$={(event: any) => {
                state.newSelectedListName = event.target.value;
                const trimmedName = state.newSelectedListName!.trim();
                if (
                  !trimmedName ||
                  (state.selectedList !== trimmedName &&
                    !!state.lists.filter(({ name }) => name === trimmedName)
                      .length)
                ) {
                  state.newSelectedListNameIsValid = false;
                } else {
                  state.newSelectedListNameIsValid = true;
                }
              }}
              // onInput={(event: ChangeEvent<HTMLInputElement>) => {
              //   const newTodoText = event.target.value;
              //   const trimmedNewTodoText = newTodoText.trim();
              //   const oldTodoText =
              //     editingTodoDetails.oldTodoText;
              //   const invalid = !trimmedNewTodoText
              //     ? true
              //     : oldTodoText === trimmedNewTodoText
              //     ? false
              //     : !!todos.filter(
              //         ({ text }) => text === trimmedNewTodoText
              //       ).length;
              //   setEditingTodoDetails({
              //     oldTodoText,
              //     newTodoText,
              //     invalid,
              //   });
              // }}
              onKeyUp$={async (event: any) => {
                if (event.key === "Enter" && state.newSelectedListNameIsValid) {
                  const trimmedName = state.newSelectedListName!.trim();
                  const success = await editTodoList(
                    state.currentUser!,
                    state.selectedList!,
                    trimmedName
                  );
                  if (success) {
                    state.lists = state.lists.map((list) =>
                      list.name !== state.selectedList
                        ? list
                        : { ...list, name: trimmedName }
                    );
                    state.editingSelectedList = false;
                    const selectedList = trimmedName;
                    dispatchPiercingEvent(ref.current!, {
                      type: "todo-list-selected",
                      payload: {
                        list: state.lists.find(
                          ({ name }) => name === selectedList
                        ),
                      },
                    });
                    state.selectedList = selectedList;
                    state.newSelectedListName = null;
                  }
                }
              }}
              // onKeyUp={(
              //   event: React.KeyboardEvent<HTMLInputElement>
              // ) => {
              //   if (
              //     event.key === "Enter" &&
              //     !editingTodoDetails.invalid
              //   ) {
              //     const trimmedNewTodoText =
              //       editingTodoDetails.newTodoText.trim();
              //     editTodo(
              //       currentUser,
              //       listName,
              //       editingTodoDetails.oldTodoText,
              //       {
              //         text: trimmedNewTodoText,
              //         done,
              //       }
              //     );
              //     setTodosListDetails({
              //       listName,
              //       todos: todos.map(({ text, done }) => ({
              //         text:
              //           text === editingTodoDetails.oldTodoText
              //             ? trimmedNewTodoText
              //             : text,
              //         done,
              //       })),
              //     });
              //     setEditingTodoDetails(null);
              //   }
              // }}
              onBlur$={() => {
                state.editingSelectedList = false;
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
});
