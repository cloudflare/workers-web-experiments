import { renderToReadableStream } from "react-dom/server";
import App from "../App";

import { parse } from "cookie";

import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
// @ts-ignore
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
import { wrapStreamInText } from "piercing-library";
import { EnvContext } from "../env";
import { getList } from "../api";
const assetManifest = JSON.parse(manifestJSON);

export interface Env {
  backend: Fetcher;
  __STATIC_CONTENT: any;
}

declare const globalThis: {
  backendWorkerFetcher: Fetcher;
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    globalThis.backendWorkerFetcher = env.backend;
    const cookie = parse(request.headers.get("Cookie") || "");
    const currentUser = cookie["piercingDemoSuite_currentUser"] ?? null;

    const url = new URL(request.url);
    const pathname = url.pathname;

    const requestIsForIndex = /^\/(_fragment\/todos(\/todos)?\/?)?$/.test(
      pathname
    );

    if (!requestIsForIndex) {
      return fetchAsset(request, ctx, env);
    }

    const listName = url.searchParams.get("listName");
    let todosListDetails = undefined;
    if (currentUser && listName) {
      const list = await getList(
        currentUser,
        decodeURIComponent(listName),
        request.headers.get("Cookie") || ""
      );
      if (list) {
        todosListDetails = list;
      }
    }

    const baseUrl = request.url
      .replace(/todos\/todos/, "todos")
      .replace(/(\?[^/]*)\/?$/, "");

    const initialPageHtml = await fetchAsset(
      new Request(`${baseUrl}/index.html`),
      ctx,
      env
    ).then((res) => res.text());

    const indexOfFragmentDiv = initialPageHtml.indexOf(
      '<div id="todos-fragment-root"></div>'
    );
    const indexForFragment =
      indexOfFragmentDiv + '<div id="todos-fragment-root">'.length;
    const pre = initialPageHtml.slice(0, indexForFragment);
    const post = initialPageHtml.slice(indexForFragment);

    const stream = wrapStreamInText(
      pre,
      post,
      await renderToReadableStream(
        <EnvContext.Provider value={{ currentUser }}>
          <App todosListDetails={todosListDetails} />
        </EnvContext.Provider>
      )
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
      },
    });
  },
};

async function fetchAsset(request: Request, ctx: ExecutionContext, env: Env) {
  return getAssetFromKV(
    {
      request,
      waitUntil(promise) {
        return ctx.waitUntil(promise);
      },
    },
    {
      ASSET_NAMESPACE: env.__STATIC_CONTENT,
      ASSET_MANIFEST: assetManifest,
    }
  );
}
