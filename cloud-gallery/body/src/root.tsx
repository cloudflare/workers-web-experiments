import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { FragmentPlaceholder } from "helpers";
import styles from "./Body.css?inline";

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <div class="content">
      <FragmentPlaceholder name="filter" />
      <FragmentPlaceholder name="gallery" />
    </div>
  );
});
