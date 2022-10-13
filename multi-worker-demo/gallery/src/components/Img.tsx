import { component$, useContext, useStylesScoped$ } from "@builder.io/qwik";
import { BaseContext } from "helpers";
import CSS from "../Gallery.css?inline";

interface Props {
  src: string;
  tags: string[];
}

export const Img = component$<Props>((props) => {
  useStylesScoped$(CSS);

  // The base path to assets that are hosted by this Worker.
  // Until the SSRed output from the Worker is used in another component,
  // we don't know what this base path would be.
  const { base } = useContext(BaseContext);
  return (
    <div class="image-container">
      <img class="cloud-image" alt="cloud picture" src={base + props.src} />
      <div class="tags">{props.tags.join(", ")}</div>
    </div>
  );
});
