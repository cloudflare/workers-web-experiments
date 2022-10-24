import { component$, PropFunction } from "@builder.io/qwik";

export const TodoListsCarouselPreviousSection = component$(
  ({
    previousHidden,
    previousDisabled,
    onGoToPrevious$,
    previousListName,
    previousPreviousListName,
  }: {
    previousHidden: boolean;
    previousDisabled: boolean;
    onGoToPrevious$: PropFunction<() => void>;
    previousListName: string | null;
    previousPreviousListName: string | null;
  }) => {
    return (
      <>
        <button
          disabled={previousDisabled}
          class={`btn nav-btn left ${previousHidden ? "hidden" : ""}`}
          onClick$={onGoToPrevious$}
        >
          &lt;
        </button>
        {previousPreviousListName && (
          <div class={"todo-list-card previous-previous-list"}>
            {previousPreviousListName}
          </div>
        )}
        <button
          class={`todo-list-card previous-list ${
            previousHidden ? "hidden" : ""
          }`}
          disabled={previousDisabled}
          onClick$={onGoToPrevious$}
        >
          {previousListName || ""}
        </button>
      </>
    );
  }
);
