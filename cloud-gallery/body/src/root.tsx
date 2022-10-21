import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { FragmentPlaceholder } from "helpers";
import styles from "./Body.css?inline";

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <div class="content">
      <div class="filter-fragment">
        <FragmentPlaceholder name="filter" />
      </div>
      <div class="gallery-fragment">
        <FragmentPlaceholder name="gallery" />
      </div>
    </div>
  );
});
