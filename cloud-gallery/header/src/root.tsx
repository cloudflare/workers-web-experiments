import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { Image, useFragmentRoot } from "helpers";
import HeaderCSS from "./Header.css?inline";
import { Slider } from "./Slider/Slider";

export const Header = component$(() => {
  useStylesScoped$(HeaderCSS);
  useFragmentRoot();

  return (
    <>
      <Slider />

      <div class="container">
        <Image alt="Cloudflare logo" src="cf-logo.png" width="74" height="35" />
        <div class="title">Cloud Gallery</div>
        <a href="https://github.com/cloudflare/workers-web-experiments/tree/main/cloud-gallery">
          <Image
            alt="Github icon"
            aria-label="Link to Github repository"
            width="35px"
            height="35px"
            src="github-icon.svg"
          />
        </a>
      </div>
    </>
  );
});
