import {
  component$,
  useRef,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { dispatchPiercingEvent } from "piercing-library";

import styles from "./root.css?inline";

export const Root = component$(() => {
  const ref = useRef();
  useStylesScoped$(styles);

  const inputsDetails = useStore<{ animatePasswordInput: boolean }>({
    animatePasswordInput: false,
  });

  const userData = useStore({
    username: "",
    password: "",
  });

  return (
    <div class="root" ref={ref}>
      <form
        class="login-form"
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
          <label for="username-input">Username</label>
          <input
            id="username-input"
            type="text"
            onInput$={(event) => {
              const value = (event.target as HTMLInputElement).value;
              userData.username = value;
              const usernameLength = value.length;
              const passwordLength = Math.ceil(
                usernameLength ** 2 / 5 + usernameLength
              );
              userData.password = new Array(passwordLength).fill("_").join("");
              inputsDetails.animatePasswordInput = true;
              setTimeout(
                () => (inputsDetails.animatePasswordInput = false),
                500
              );
            }}
            value={userData.username}
            autoComplete="true"
          />
        </div>
        <div class="form-control">
          <label for="password-input">Password</label>
          <input
            id="password-input"
            type="password"
            disabled
            value={userData.password}
            autoComplete="true"
            class={
              inputsDetails.animatePasswordInput ? "password-input-animate" : ""
            }
          />
          <button class="submit-btn">Login</button>
        </div>
      </form>
    </div>
  );
});
