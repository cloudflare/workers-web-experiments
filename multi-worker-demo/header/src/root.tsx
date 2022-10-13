import { component$, useStylesScoped$ } from "@builder.io/qwik";
import HeaderCSS from "./Header.css?inline";
import { Slider } from "./Slider/Slider";

export const Header = component$(({ base }: { base: string }) => {
  useStylesScoped$(HeaderCSS);

  return (
    <header>
      <Slider />

      <div class="container">
        <img alt="Cloudflare logo" class="cf-icon" src={base + "cf-logo.png"} />
        <div class="title">Cloud Gallery</div>
        <a href="https://github.com/cloudflare/workers-web-experiments">
          <img
            alt="Github icon"
            aria-label="Link to Github repository"
            class="github-icon"
            src={base + "github-icon.svg"}
          />
        </a>
      </div>
    </header>
  );
});
