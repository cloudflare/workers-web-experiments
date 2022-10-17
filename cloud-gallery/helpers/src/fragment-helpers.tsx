import { component$, SSRStream, useEnvData } from "@builder.io/qwik";

export const FragmentPlaceholder = component$(({ name }: { name: string }) => {
  const env = useEnvData<Record<string, unknown>>("env")!;
  const request = useEnvData<Request>("request")!;
  const decoder = new TextDecoder();
  return (
    <SSRStream>
      {async (streamWriter) => {
        const fragment = await fetchFragment(env, name, request);
        const reader = fragment.getReader();
        let fragmentChunk = await reader.read();
        while (!fragmentChunk.done) {
          streamWriter.write(decoder.decode(fragmentChunk.value));
          fragmentChunk = await reader.read();
        }
      }}
    </SSRStream>
  );
});

/**
 * Attempt to get an asset hosted by a fragment service.
 *
 * Such asset requests start with `/_fragment/{service-name}/`, which enables us
 * to choose the appropriate service binding and delegate the request there.
 */
export async function tryGetFragmentAsset(
  env: Record<string, unknown>,
  request: Request
) {
  const url = new URL(request.url);
  const match = /^\/_fragment\/([^/]+)(\/.*)$/.exec(url.pathname);
  if (match === null) {
    return null;
  }
  const serviceName = match[1];
  const service = env[serviceName];
  if (!isFetcher(service)) {
    throw new Error("Unknown fragment service: " + serviceName);
  }
  return await service.fetch(
    new Request(new URL(match[2], request.url), request)
  );
}

export async function fetchFragment(
  env: Record<string, unknown>,
  fragmentName: string,
  request: Request
) {
  const service = env[fragmentName];
  if (!isFetcher(service)) {
    throw new Error(
      `Fragment ${fragmentName} does not have an equivalent service binding.`
    );
  }
  const url = new URL(request.url);
  url.searchParams.set("base", `/_fragment/${fragmentName}/`);
  const response = await service.fetch(new Request(url, request));
  if (response.body === null) {
    throw new Error(`Response from "${fragmentName}" request is null.`);
  }
  return response.body;
}

function isFetcher(obj: unknown): obj is Fetcher {
  return Boolean((obj as Fetcher).fetch);
}
