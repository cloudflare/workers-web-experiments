import {
  $,
  component$,
  PropFunction,
  useSignal,
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

    const todoListInputState = useStore<{
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

    const editRef = useSignal<HTMLInputElement>();
    editRef.value?.focus();

    useWatch$(({ track }) => {
      track(() => listName);
      todoListInputState.editing = false;
    });

    const handleInputChange = $((event: Event) => {
      const value = (event.target as HTMLInputElement).value;
      todoListInputState.value = value;
      todoListInputState.dirty = true;
      const trimmedValue = value.trim();
      if (trimmedValue === listName) {
        todoListInputState.valid = true;
        return;
      }
      if (
        !trimmedValue ||
        trimmedValue.length > 20 ||
        !!todoListsNames.includes(trimmedValue)
      ) {
        todoListInputState.valid = false;
        return;
      }
      todoListInputState.valid = true;
    });

    const editListNameIfValid = $(async () => {
      const newListName = todoListInputState.value!.trim();
      if (
        listName !== newListName &&
        todoListInputState.dirty &&
        todoListInputState.valid
      ) {
        const success = await onEditListName$(newListName);
        if (success) {
          todoListInputState.editing = false;
        }
      }
    });

    const handleInputBlur = $(() => {
      editListNameIfValid();
      todoListInputState.editing = false;
    });

    const handleInputKeyUp = $((event: KeyboardEvent) => {
      if (event.key === "Enter") {
        editListNameIfValid();
      }
    });

    const startEditing = $(() => {
      if (!todoListInputState.editing) {
        todoListInputState.editing = true;
        todoListInputState.value = listName;
        todoListInputState.valid = true;
        todoListInputState.dirty = false;
      }
    });

    return (
      <div class="todo-list-card selected-list-wrapper">
        <div
          tabIndex={0}
          class="todo-list-card selected-list"
          onClick$={startEditing}
          onKeyDown$={(event) => event.code === "Enter" && startEditing()}
        >
          {!todoListInputState.editing && <span>{listName}</span>}
          {todoListInputState.editing && (
            <input
              enterKeyHint="done"
              ref={editRef}
              type="text"
              class={`selected-list-edit ${
                todoListInputState.valid ? "" : "invalid"
              }`}
              value={todoListInputState.value ?? undefined}
              onInput$={handleInputChange}
              onBlur$={handleInputBlur}
              onKeyUp$={handleInputKeyUp}
            />
          )}
        </div>
        <button
          class="btn delete-btn"
          disabled={todoListInputState.editing || todoListsNames.length <= 1}
          onClick$={onDeleteList$}
          aria-label="delete list"
        >
          X
        </button>
      </div>
    );
  }
);
