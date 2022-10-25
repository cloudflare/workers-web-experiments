import {
  $,
  component$,
  useSignal,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { dispatchPiercingEvent } from "piercing-library";

import styles from "./root.css?inline";

const enum InputErrorMessages {
  noSpaces = "Spaces are not allowed",
  noSpecialCharacters = "Special characters are not allowed",
  maxLength = "The provided username is too long, it needs not to be longer than 20 characters",
  emptyInput = "Please provide a username",
}
interface LoginState {
  animatePassword: boolean;
  usernameError: InputErrorMessages | null;
  usernameTouched: boolean;
  username: string;
  password: string;
  loading: boolean;
}

export const getUsernameInputError = (
  input: string,
  inputTouched: boolean
): InputErrorMessages | null => {
  if (input.includes(" ")) return InputErrorMessages.noSpaces;
  if (/[^a-zA-Z0-9]/.test(input)) return InputErrorMessages.noSpecialCharacters;
  if (input.length > 20) return InputErrorMessages.maxLength;
  if (inputTouched && !input) return InputErrorMessages.emptyInput;
  return null;
};

export const Root = component$(() => {
  const ref = useSignal<Element>();
  useStylesScoped$(styles);

  const state = useStore<LoginState>({
    animatePassword: false,
    usernameError: null,
    usernameTouched: false,
    username: "",
    password: "",
    loading: false,
  });

  const dispatchLoginEvent = $(() => {
    dispatchPiercingEvent(ref.value!, {
      type: "login",
      payload: {
        username: state.username,
        password: state.password,
      },
    });
    state.loading = true;
  });

  const handleFocus = $(() => (state.usernameTouched = true));

  const handleInput = $((event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    state.username = value;
    const usernameLength = value.length;
    const passwordLength = Math.ceil(usernameLength ** 2 / 5 + usernameLength);
    state.password = new Array(passwordLength).fill("_").join("");
    state.animatePassword = true;
    setTimeout(() => (state.animatePassword = false), 500);
    state.usernameError = getUsernameInputError(value, state.usernameTouched);
  });

  return (
    <div class="root" ref={ref}>
      <form
        class="login-form"
        preventdefault:submit
        onSubmit$={dispatchLoginEvent}
      >
        <div class="form-control">
          <label for="username-input">Username</label>
          <input
            id="username-input"
            class={state.usernameError ? "invalid" : ""}
            type="text"
            onFocus$={handleFocus}
            onInput$={handleInput}
            value={state.username}
            autoComplete="true"
            placeholder="What's your name?"
          />
          {state.usernameError && (
            <p class="input-error-message">{state.usernameError}</p>
          )}
        </div>
        <div class="form-control">
          <label for="password-input">Password</label>
          <input
            id="password-input"
            type="password"
            disabled
            value={state.password}
            autoComplete="true"
            class={state.animatePassword ? "password-input-animate" : ""}
          />
          <button
            disabled={state.loading || !state.username || !!state.usernameError}
            class={`submit-btn ${state.loading ? "loading" : ""}`}
          >
            <span class="text">Login</span>
            <span class="loading-spinner"></span>
          </button>
        </div>
      </form>
    </div>
  );
});
