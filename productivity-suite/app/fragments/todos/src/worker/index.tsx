import { renderToReadableStream } from "react-dom/server";
import App from "../App";

import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
// @ts-ignore
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
import { wrapStreamInText } from "piercing-library";
import { EnvContext } from "../env";
import { getCurrentUser, getTodoList, getTodoLists } from "shared";
const assetManifest = JSON.parse(manifestJSON);

export interface Env {
  backend: Fetcher;
  __STATIC_CONTENT: any;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const requestCookie = request.headers.get("Cookie") || "";

    const currentUser = await getCurrentUser(requestCookie);

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

    if (currentUser) {
      if (listName) {
        const list = await getTodoList(
          currentUser,
          decodeURIComponent(listName),
          requestCookie
        );
        if (list) {
          todosListDetails = list;
        }
      } else {
        const lists = await getTodoLists(currentUser, requestCookie);
        if (lists.length) {
          todosListDetails = lists[lists.length - 1];
        }
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
