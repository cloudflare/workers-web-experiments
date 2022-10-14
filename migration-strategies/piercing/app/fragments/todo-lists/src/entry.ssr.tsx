import { renderToStream } from "@builder.io/qwik/server";
import { manifest } from "@qwik-client-manifest";
import { Root } from "./root";
import { parse } from "cookie";

export default {
  async fetch(request: Request): Promise<Response> {
    const { writable, readable } = new TransformStream();
    const writer = writable.getWriter();

    const cookie = parse(request.headers.get("Cookie") || "");
    const currentUser = cookie["piercingDemoSuite_currentUser"];
    const userCookieName = encodeURIComponent(
      `piercingDemoSuite_userData_${currentUser}`
    );

    const userData: { todoLists: { name: string; todos: any[] }[] } =
      (cookie[userCookieName] &&
        JSON.parse(decodeURIComponent(cookie[userCookieName]))) ??
      null;
    const url = new URL(request.url);
    const listName = url.searchParams.get("listName") ?? null;

    const selectedListName =
      listName ??
      (userData.todoLists &&
        userData.todoLists[userData.todoLists.length - 1].name);

    const stream = {
      write: (chunk: any) => {
        if (typeof chunk === "string") {
          const encoder = new TextEncoder();
          writer.write(encoder.encode(chunk));
        } else {
          writer.write(chunk);
        }
      },
    };

    renderToStream(<Root />, {
      manifest,
      containerTagName: "todo-lists",
      qwikLoader: { include: "never" },
      base: "_fragment/todo-lists/build",
      stream,
      envData: {
        currentUser,
        userData,
        selectedListName,
      },
    }).finally(() => writer.close());

    return new Response(readable, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
};
