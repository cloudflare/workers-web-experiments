import { createSignal } from "solid-js";
import { Title, useRouteData } from "solid-start";
import { HttpStatusCode } from "solid-start/server";

export function News() {
  const [count, setCount] = createSignal(8);

  return (
    <>
      <h1>counter</h1>
      <button class="increment" onClick={() => setCount(count() + 1)}>
        Clicks: {count()}
      </button>
    </>
  );
}
