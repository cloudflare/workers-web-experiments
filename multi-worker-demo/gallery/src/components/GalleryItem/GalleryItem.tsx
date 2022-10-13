import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { Image } from "helpers";
import CSS from "./GalleryItem.css?inline";

interface Props {
  src: string;
  tags: string[];
}

export const GalleryItem = component$<Props>((props) => {
  useStylesScoped$(CSS);
  return (
    <div class="image-container">
      <Image class="cloud-image" alt="cloud picture" src={props.src} />
      <div class="tags">{props.tags.join(", ")}</div>
    </div>
  );
});
