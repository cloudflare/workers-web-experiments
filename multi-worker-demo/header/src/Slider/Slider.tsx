import { component$, useStore, useStylesScoped$, $ } from "@builder.io/qwik";
import { getCookie, saveCookie } from "helpers";
import styles from "./Slider.css?inline";

export const Slider = component$(() => {
  useStylesScoped$(styles);

  const delay = getCookie("delay") ?? "0";
  const store = useStore<{ delay: string }>({ delay });

  // Handles dragging along the slider, giving real time feedback to the user
  // about the current value
  const handleSliderInput$ = $((e: Event) => {
    store.delay = (e.target as HTMLInputElement).value;
  });

  // Fires once the slider stops being dragged
  const handleSliderChange$ = $((e: Event) => {
    store.delay = (e.target as HTMLInputElement).value;
    saveCookie("delay", store.delay);
  });

  return (
    <div class="slider-container">
      <div class="slider-content">
        <label class="label" for="delay-slider">
          Gallery List Delay:
        </label>

        <input
          id="delay-slider"
          class="slider"
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={store.delay}
          onChange$={handleSliderChange$}
          onInput$={handleSliderInput$}
        />

        <span class="label">{store.delay} seconds</span>
      </div>
    </div>
  );
});
