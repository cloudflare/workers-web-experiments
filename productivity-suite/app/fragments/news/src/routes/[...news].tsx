import {
  Component,
  createResource,
  createSignal,
  For,
  Show,
  Suspense,
} from "solid-js";
import Story from "~/components/story";
import fetchAPI from "~/lib/api";
import { IStory } from "~/types";

const StoryList: Component<{ page: number }> = (props) => {
  const [stories] = createResource<IStory[], string>(
    () => `news?page=${props.page}`,
    fetchAPI
  );
  return (
    <main class="news-list">
      <Suspense>
        <Show when={stories()}>
          <ul>
            <For each={stories()}>{(story) => <Story story={story} />}</For>
          </ul>
        </Show>
      </Suspense>
    </main>
  );
};

export default function News() {
  const [page, setPage] = createSignal<number>(1);

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
        <button
          class="page-link"
          onClick={() => {
            setPage(page() + 1);
          }}
        >
          more {">"}
        </button>
      </div>
      <StoryList page={page()}></StoryList>
    </div>
  );
}
