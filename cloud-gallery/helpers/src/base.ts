import {
  createContext,
  useContextProvider,
  useEnvData,
} from "@builder.io/qwik";

/**
 * A context containing information about this Worker as a fragment.
 *
 * Primarily the `base` path of the fragment used to route asset requests to the correct Worker.
 */
export const FragmentContext = createContext<{ base: string }>(
  "FragmentContext"
);

/**
 * Use this hook to ensure that the `FragmentContext` is initialized across the app.
 *
 * You should only call this hook at the root of a fragment, since it relies upon
 * `envData` that will only be available during first render on the server.
 */
export function useFragmentRoot() {
  const base = useEnvData("fragmentBase");
  useContextProvider(FragmentContext, { base });
}

/**
 * Get the `base` path for this fragment from the `Request`.
 *
 * This path is used to tell the container of this fragment how to proxy requests for
 * assets that are hosted by this fragment.
 */
export function getBase(request: Request): string {
  const url = new URL(request.url);
  return url.searchParams.get("base") ?? "/";
}
