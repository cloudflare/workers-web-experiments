import { component$, PropFunction } from "@builder.io/qwik";

export const TodoListsCarouselNextSection = component$(
  ({
    nextHidden,
    nextDisabled,
    onGoToNext$,
    nextListName,
    nextNextListName,
    onAddNewList$,
  }: {
    nextHidden: boolean;
    nextDisabled: boolean;
    onGoToNext$: PropFunction<() => void>;
    nextListName: string | null;
    nextNextListName: string | null;
    onAddNewList$: PropFunction<() => void>;
  }) => {
    return (
      <>
        {nextListName && (
          <button
            class={`todo-list-card next-list ${nextHidden ? "hidden" : ""}`}
            disabled={nextDisabled}
            onClick$={onGoToNext$}
          >
            {nextListName}
          </button>
        )}
        {nextHidden && (
          <button
            class={`todo-list-card next-list add-btn`}
            disabled={nextDisabled}
            onClick$={onAddNewList$}
          >
            Add List
          </button>
        )}
        <div
          class={`todo-list-card next-next-list ${
            !nextNextListName ? "add-btn" : ""
          }`}
        >
          {nextNextListName || "Add List"}
        </div>
        <button
          disabled={nextDisabled}
          class={`btn nav-btn right ${nextHidden ? "hidden" : ""}`}
          onClick$={onGoToNext$}
        >
          &gt;
        </button>
        {nextHidden && (
          <button
            class="btn nav-btn right"
            onClick$={onAddNewList$}
            disabled={nextDisabled}
          >
            +
          </button>
        )}
      </>
    );
  }
);
