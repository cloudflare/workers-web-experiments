import { component$, useStylesScoped$ } from "@builder.io/qwik";

import styles from "./root.css?inline";

export const Root = component$(() => {
  useStylesScoped$(styles);

  return (
    <div class="root">
      <h2>Login Fragment</h2>
    </div>
  );
});
