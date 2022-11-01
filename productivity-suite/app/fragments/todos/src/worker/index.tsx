import { renderToReadableStream } from "react-dom/server";
import App from "../App";

import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
// @ts-ignore
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
import {
  createServerSideMessageBusFromRequest,
  getBus,
  wrapStreamInText,
} from "piercing-library";
import { EnvContext } from "../env";
import { getTodoList, getTodoLists, TodoList } from "shared";
const assetManifest = JSON.parse(manifestJSON);

export interface Env {
  __STATIC_CONTENT: any;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    createServerSideMessageBusFromRequest(request);
    const url = new URL(request.url);
    const response = await fetchAsset(request, ctx, env);

    const requestIsForAsset = /\.[^.\/]+$/.test(url.pathname);
    if (requestIsForAsset) {
      return response;
    }

    const requestCookie = request.headers.get("Cookie") || "";
    const currentUser = await Promise.race([
      new Promise<string>((resolve) => {
        getBus(null).listen({
          eventName: "authentication",
          callback: ({ username }: { username: string }) => {
            resolve(username);
          },
          options: { once: true },
        });
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
    ]);

    const listName = await Promise.race([
      new Promise<string | null>((resolve) => {
        getBus(null).listen({
          eventName: "todo-list-selected",
          callback: ({ name }: { name: string }) => {
            resolve(name);
          },
          options: { once: true },
        });
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
    ]);

    const todoList = await getCurrentTodoList(
      requestCookie,
      currentUser,
      listName
    );

    const baseUrl = request.url
      .replace(/todos\/todos/, "todos")
      .replace(/(\?[^/]*)\/?$/, "");

    const initialPageHtml = await fetchAsset(
      new Request(`${baseUrl}/index.html`),
      ctx,
      env
    ).then((res) => res.text());

    const appRootElement = '<div id="todos-fragment-root">';
    const indexOfFragmentDiv = initialPageHtml.indexOf(appRootElement);
    const indexForFragment = indexOfFragmentDiv + appRootElement.length;
    const pre = initialPageHtml.slice(0, indexForFragment);
    const post = initialPageHtml.slice(indexForFragment);
    const stream = wrapStreamInText(
      pre,
      post,
      await renderToReadableStream(
        <EnvContext.Provider value={{ currentUser }}>
          <App todoList={todoList} />
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

async function getCurrentTodoList(
  requestCookie: string,
  currentUser: string | null,
  listName: string | null
): Promise<TodoList | null> {
  if (currentUser) {
    if (listName) {
      return (
        (await getTodoList(
          currentUser,
          decodeURIComponent(listName),
          requestCookie
        )) ?? null
      );
    } else {
      const lists = await getTodoLists(currentUser, requestCookie);
      if (lists.length) {
        return lists[lists.length - 1];
      }
    }
  }
  return null;
}
