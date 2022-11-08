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

export default function News() {
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
          <button class="page-link" onClick={() => setPage(page() - 1)}>
            {"<"} prev
          </button>
        </Show>
        <span>page {page()}</span>
        <button class="page-link" onClick={() => setPage(page() + 1)}>
          more {">"}
        </button>
      </div>
      <main class="news-list" classList={{ pending: stories.loading }}>
        <Suspense fallback={<StoryList stories={stories.latest}></StoryList>}>
          <StoryList stories={stories()}></StoryList>
        </Suspense>
      </main>
    </div>
  );
}

const StoryList: Component<{ stories: IStory[] }> = (props) => {
  return (
    <ul>
      <For each={props.stories}>{(story) => <Story story={story} />}</For>
    </ul>
  );
};
