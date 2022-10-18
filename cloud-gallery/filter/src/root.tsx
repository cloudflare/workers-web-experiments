import {
  component$,
  useStylesScoped$,
  useStore,
  useRef,
  Ref,
  $,
  useOnDocument,
} from "@builder.io/qwik";
import styles from "./Filter.css?inline";
import { tags } from "../../constants";
import { useLocation, isBrowser } from "helpers";
interface State {
  inputValue: string;
  searchResults: string[];
}

export const findTags = (query: string): string[] => {
  return tags.reduce<string[]>(
    (acc, tag) => (tag.indexOf(query) !== -1 ? [...acc, tag] : [...acc]),
    []
  );
};

export const Filter = component$(() => {
  useStylesScoped$(styles);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialValue = queryParams.get("tag") ?? "";

  const state = useStore<State>(
    {
      inputValue: initialValue,
      searchResults: [],
    },
    { recursive: true }
  );

  const listRef = useRef();
  const containerRef = useRef();

  // Dismiss the results after clicking outside
  useOnDocument(
    "click",
    $((event) => {
      if (!containerRef.current || !event.target) return;

      if (!containerRef.current.contains(event.target as Node)) {
        state.searchResults = [];
      }
    })
  );

  return (
    <div ref={containerRef}>
      <div>
        <input
          tabIndex={0}
          autoFocus={true}
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="off"
          class="input"
          type="text"
          placeholder="Search by tag (ex. classic)"
          onKeyUp$={(ev) => {
            const currentValue = (ev.target as HTMLInputElement).value;

            if (ev.key === "ArrowDown") {
              ev.preventDefault();
              const firstLink = listRef.current?.querySelector(
                `:first-child > a`
              ) as HTMLAnchorElement;
              firstLink.focus();
              return;
            }

            if (ev.key === "Enter") {
              if (state.searchResults.length === 1) {
                ev.preventDefault();
                state.inputValue = state.searchResults[0];
                const firstLink = listRef.current?.querySelector(
                  `:first-child > a`
                ) as HTMLAnchorElement;
                firstLink.click();
                return;
              }

              if (currentValue === "") {
                //     state.searchResults = [];
                if (isBrowser()) {
                  window.location.assign("/");
                }
                return;
              }
            }
            if (currentValue === "") {
              state.searchResults = [];
            } else {
              state.searchResults = findTags(currentValue);
            }

            // Populate the input with the full selected value
            state.inputValue = currentValue;
          }}
          value={state.inputValue}
        />
      </div>
      <SearchResults listRef={listRef} state={state}></SearchResults>
    </div>
  );
});

export const SearchResults = component$(
  (props: { state: State; listRef: Ref }) => {
    useStylesScoped$(styles);

    const searchResults = props.state.searchResults;

    const getListElement = $((i: number) => {
      return props.listRef.current?.querySelector(
        `:nth-child(${i + 1}) > a`
      ) as HTMLAnchorElement;
    });

    return searchResults?.length ? (
      <ul class="result-list" ref={props.listRef}>
        {searchResults.map((result, i) => {
          return (
            <li
              class="result-list-item"
              onKeyDown$={async (ev) => {
                if (ev.key === "ArrowDown") {
                  ev.preventDefault();
                  if (i === searchResults.length - 1) return;
                  const element = await getListElement(i + 1);
                  element.focus();
                } else if (ev.key === "ArrowUp") {
                  ev.preventDefault();
                  if (i === 0) return;
                  const element = await getListElement(i - 1);
                  element.focus();
                }
              }}
              onClick$={() => {
                props.state.searchResults = [];
                props.state.inputValue = result;
              }}
            >
              <a class="link" href={`?tag=${result}`}>
                {result}
              </a>
            </li>
          );
        })}
      </ul>
    ) : null;
  }
);
