import { createResource, createSignal, For, Show } from "solid-js";
import Story from "~/components/story";
import fetchAPI from "~/lib/api";
import { IStory } from "~/types";

export default function Counter() {
  const [page, setPage] = createSignal<number>(1);
  const [stories] = createResource<IStory[], string>(
    () => `news?page=${page()}`,
    fetchAPI
  );

  return (
    <div class="news-view">
      <div class="news-list-nav">
        <Show
          when={page() > 1}
          fallback={
            <span class="page-link disabled" aria-disabled="true">
              {"<"} prev
            </span>
          }
        >
          <button
            class="page-link"
            onClick={() => {
              setPage(page() - 1);
            }}
          >
            {"<"} prev
          </button>
        </Show>
        <span>page {page()}</span>
        <Show
          when={stories() && stories().length >= 29}
          fallback={
            <span class="page-link disabled" aria-disabled="true">
              more {">"}
            </span>
          }
        >
          <button
            class="page-link"
            onClick={() => {
              setPage(page() + 1);
            }}
          >
            more {">"}
          </button>
        </Show>
      </div>
      <main class="news-list">
        <Show when={stories()}>
          <ul>
            <For each={stories()}>{(story) => <Story story={story} />}</For>
          </ul>
        </Show>
      </main>
    </div>
  );
}
