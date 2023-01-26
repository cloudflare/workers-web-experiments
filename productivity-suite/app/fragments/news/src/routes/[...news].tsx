import {
  Component,
  createResource,
  createSignal,
  For,
  onMount,
  Show,
  Suspense,
  createEffect,
} from "solid-js";
import Story from "~/components/story";
import fetchAPI from "~/lib/api";
import { IStory } from "~/types";
import { getBus, getFragmentHost } from "piercing-library";

export default function News() {
  let ref: HTMLDivElement;

  const [page, setPage] = createSignal<number>(1);

  onMount(() => {
    getBus(ref).listen<{ page: number }>("news-page", ({ page }) => {
      if (isFinite(page) && page > 0) {
        setPage(page);
      }
    });
  });

  onMount(() => {
    const host = getFragmentHost(ref);
    if (host === null) {
      throw new Error(
        "Missing <piercing-fragment-host> container for this fragment."
      );
    }
    // When the fragment gets removed we send a message to clear the current page
    // from the message bus to ensure that if we return to this fragment, its page
    // is not initialized incorrectly.
    host.onCleanup(() => getBus(ref).dispatch("change-news-page", {}));
  });

  const updatePage = (newPage: number) => {
    setPage(newPage);
    getBus(ref).dispatch("change-news-page", { page: newPage });
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
