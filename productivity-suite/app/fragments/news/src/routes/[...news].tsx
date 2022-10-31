import { createResource, createSignal, For, Show } from "solid-js";
import { Title, useRouteData } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import Story from "~/components/story";
import fetchAPI from "~/lib/api";
import { IStory } from "~/types";

export default function Counter() {
  // const [count, setCount] = createSignal(8);

  // return (
  //   <>
  //     <h1>counter</h1>
  //     <button class="increment" onClick={() => setCount(count() + 1)}>
  //       Clicks: {count()}
  //     </button>
  //   </>
  // );
  const [page, setPage] = createSignal<number>(1);

  // return (
  //   <div>
  //     <span>counter: {page()} </span>
  //     <button
  //       onClick={() => {
  //         setPage(page() + 1);
  //       }}
  //     >
  //       Increase
  //     </button>
  //   </div>
  // );
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
