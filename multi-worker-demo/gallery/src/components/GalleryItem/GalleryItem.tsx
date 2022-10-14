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
    <div class="gallery-item">
      <Image alt="cloud picture" src={props.src} width="300" height="450" />
      <div class="tags">{props.tags.join(", ")}</div>
    </div>
  );
});
