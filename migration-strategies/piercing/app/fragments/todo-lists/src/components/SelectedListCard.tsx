import {
  component$,
  PropFunction,
  useRef,
  useStore,
  useStylesScoped$,
  useWatch$,
} from "@builder.io/qwik";

import styles from "./SelectedListCard.css?inline";

export const SelectedListCard = component$(
  ({
    listName,
    todoListsNames,
    onEditListName$,
    onDeleteList$,
  }: {
    listName: string;
    todoListsNames: string[];
    onEditListName$: PropFunction<(newName: string) => boolean>;
    onDeleteList$: PropFunction<() => void>;
  }) => {
    useStylesScoped$(styles);

    const newTodoInputState = useStore<{
      editing: boolean;
      value: string | null;
      valid: boolean;
      dirty: boolean;
    }>({
      editing: false,
      value: null,
      valid: false,
      dirty: false,
    });

    const editRef = useRef<HTMLInputElement>();
    editRef.current?.focus();

    useWatch$(({ track }) => {
      track(() => listName);
      newTodoInputState.editing = false;
    });

    return (
      <div class="todo-list-card selected-list-wrapper">
        <button
          class="todo-list-card selected-list"
          onClick$={() => {
            if (!newTodoInputState.editing) {
              newTodoInputState.editing = true;
              newTodoInputState.value = listName;
              newTodoInputState.valid = true;
              newTodoInputState.dirty = false;
            }
          }}
        >
          {!newTodoInputState.editing && <span>{listName}</span>}
          {newTodoInputState.editing && (
            <input
              enterKeyHint="done"
              ref={editRef}
              type="text"
              class={`selected-list-edit ${
                newTodoInputState.valid ? "" : "invalid"
              }`}
              value={newTodoInputState.value ?? undefined}
              onInput$={(event) => {
                const value = (event.target as HTMLInputElement).value;
                newTodoInputState.value = value;
                newTodoInputState.dirty = true;
                const trimmedValue = value.trim();
                if (trimmedValue === listName) {
                  newTodoInputState.valid = true;
                  return;
                }
                if (
                  !trimmedValue ||
                  trimmedValue.length > 20 ||
                  !!todoListsNames.includes(trimmedValue)
                ) {
                  newTodoInputState.valid = false;
                  return;
                }
                newTodoInputState.valid = true;
              }}
              onBlur$={() => {
                newTodoInputState.editing = false;
              }}
              onKeyUp$={async (event) => {
                if (
                  event.key === "Enter" &&
                  newTodoInputState.dirty &&
                  newTodoInputState.valid
                ) {
                  const newListName = newTodoInputState.value!.trim();
                  const success = await onEditListName$(newListName);
                  if (success) {
                    newTodoInputState.editing = false;
                  }
                }
              }}
            />
          )}
        </button>
        <button
          class="btn delete-btn"
          disabled={newTodoInputState.editing || todoListsNames.length <= 1}
          onClick$={() => onDeleteList$()}
          aria-label="delete list"
        ></button>
      </div>
    );
  }
);
