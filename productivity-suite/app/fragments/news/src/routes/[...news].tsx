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
import { getBus } from "piercing-library";

export default function News() {
  let ref: HTMLDivElement;

  const [page, setPage] = createSignal<number>(1);

  getBus(ref).listen<{ page: number }>("update-news-page-view", ({ page }) => {
    if (isFinite(page) && page > 0) {
      setPage(page);
    }
  });

  const updatePage = (newPage: number) => {
    setPage(newPage);
    getBus(ref).dispatch("update-news-page-number", { page: newPage });
  };

  const [stories] = createResource<IStory[], string>(
    () => `news?page=${page()}`,
    fetchAPI
  );

  return (
    <div class="news-view" ref={ref}>
      <div class="news-list-nav">
        <Show
          when={page() > 1}
          fallback={
            <span class="page-link disabled" aria-disabled="true">
              {"<"} prev
            </span>
          }
        >
          <button class="page-link" onClick={() => updatePage(page() - 1)}>
            {"<"} prev
          </button>
        </Show>
        <span>page {page()}</span>
        <button class="page-link" onClick={() => updatePage(page() + 1)}>
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
