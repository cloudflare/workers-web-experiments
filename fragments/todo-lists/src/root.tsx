import {
  component$,
  useRef,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { dispatchPiercingEvent } from "piercing-lib";

import styles from "./root.css?inline";

export const Root = component$(() => {
  const ref = useRef();
  useStylesScoped$(styles);

  return (
    <aside>
      <h3>Your Lists:</h3>
      <ul>
        <li>test</li>
        <li>test</li>
        <li>test</li>
        <li>test</li>
        <li>test</li>
        <li>test</li>
      </ul>
    </aside>
  );
});
