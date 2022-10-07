import { renderToStream } from "@builder.io/qwik/server";
import { manifest } from "@qwik-client-manifest";
import { Root } from "./root";
import { parse } from "cookie";

export default {
  async fetch(request: Request): Promise<Response> {
    const { writable, readable } = new TransformStream();
    const writer = writable.getWriter();

    const cookie = parse(request.headers.get("Cookie") || "");
    const currentUser = cookie["piercingDemoSuite_current-user"];
    const userData: { todoLists: { name: string; todos: any[] }[] } =
      JSON.parse(
        cookie[`piercingDemoSuite_userData_${currentUser}`] ??
          '{ "todoLists": [] }'
      );

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
      base: "_fragment/todo-lists",
      stream,
      envData: {
        currentUser,
        userData,
      },
    }).finally(() => writer.close());

    return new Response(readable, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
};
