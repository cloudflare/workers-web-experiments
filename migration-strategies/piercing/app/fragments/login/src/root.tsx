import {
  $,
  component$,
  useRef,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { dispatchPiercingEvent } from "piercing-library";

import styles from "./root.css?inline";

export const Root = component$(() => {
  const possibleInputErrors = {
    noSpaces: "noSpaces",
    noSpecialCharacters: "noSpecialCharacters",
    maxLength: "maxLength",
    emptyInput: "emptyInput",
  } as const;

  const inputErrorMessages: Record<
    typeof possibleInputErrors[keyof typeof possibleInputErrors],
    string
  > = {
    [possibleInputErrors.noSpaces]: "Spaces are not allowed",
    [possibleInputErrors.noSpecialCharacters]:
      "Special characters are not allowed",
    [possibleInputErrors.maxLength]:
      "The provided username is too long, it needs not to be longer than 20 characters",
    [possibleInputErrors.emptyInput]: "Please provide a username",
  };

  const ref = useRef();
  useStylesScoped$(styles);

  const inputsDetails = useStore<{
    animatePasswordInput: boolean;
    usernameInputError:
      | null
      | typeof possibleInputErrors[keyof typeof possibleInputErrors];
    usernameInputTouched: boolean;
  }>({
    animatePasswordInput: false,
    usernameInputError: null,
    usernameInputTouched: false,
  });

  const userData = useStore({
    username: "",
    password: "",
  });

  const getUsernameInputError = $(
    (
      input: string
    ): typeof possibleInputErrors[keyof typeof possibleInputErrors] | null => {
      if (input.includes(" ")) return possibleInputErrors.noSpaces;
      if (/[^a-zA-Z0-9]/.test(input))
        return possibleInputErrors.noSpecialCharacters;
      if (input.length > 20) {
        return possibleInputErrors.maxLength;
      }
      if (inputsDetails.usernameInputTouched && !userData.username) {
        return possibleInputErrors.emptyInput;
      }
      return null;
    }
  );

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
            class={inputsDetails.usernameInputError ? "invalid" : ""}
            type="text"
            onFocus$={() => (inputsDetails.usernameInputTouched = true)}
            onInput$={async (event) => {
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
              inputsDetails.animatePasswordInput = true;
              inputsDetails.usernameInputError = await getUsernameInputError(
                value
              );
              setTimeout(
                () => (inputsDetails.animatePasswordInput = false),
                500
              );
            }}
            value={userData.username}
            autoComplete="true"
          />
          {inputsDetails.usernameInputError && (
            <p class="input-error-message">
              {inputErrorMessages[inputsDetails.usernameInputError]}
            </p>
          )}
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
          <button
            disabled={!userData.username || !!inputsDetails.usernameInputError}
            class="submit-btn"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
});
