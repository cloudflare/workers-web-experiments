import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { FragmentPlaceholder } from "helpers";
import CSS from "./Body.css?inline";

export default component$(() => {
  useStylesScoped$(CSS);

  return (
    <div class="content">
      <FragmentPlaceholder name="filter" />
      <FragmentPlaceholder name="gallery" />
    </div>
  );
});
