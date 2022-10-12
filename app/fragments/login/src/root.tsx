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

  const userData = useStore({
    username: "",
    password: "",
  });

  return (
    <div class="root" ref={ref}>
      <form
        preventdefault:submit
        onSubmit$={() => {
          dispatchPiercingEvent(ref.current!, {
            type: "login",
            payload: {
              ...userData,
            },
          });
        }}
      >
        <div class="form-control">
          <label>Username</label>
          <input
            type="text"
            onInput$={(event) => {
              const value = (event.target as HTMLInputElement).value;
              userData.username = value;
              userData.password = [...value]
                .map((s) => s.charCodeAt(0))
                .join("");
            }}
            value={userData.username}
            autoComplete="true"
          />
        </div>
        <div class="form-control">
          <label>Password</label>
          <input
            type="password"
            disabled
            value={userData.password}
            autoComplete="true"
          />
          <button class="submit-btn">Login</button>
        </div>
      </form>
    </div>
  );
});
