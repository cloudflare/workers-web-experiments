import { renderToStream } from "@builder.io/qwik/server";
import { manifest } from "@qwik-client-manifest";
import { Root } from "./root";
import { initializeServerSideMessageBus } from "piercing-library";

export default {
  async fetch(request: Request): Promise<Response> {
    initializeServerSideMessageBus(request);
    const { writable, readable } = new TransformStream();
    const writer = writable.getWriter();
    const requestCookie = request.headers.get("Cookie") || "";

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
      qwikLoader: { include: "always" },
      base: "/_fragment/todo-lists/build",
      stream,
      envData: {
        requestCookie,
      },
    }).finally(() => writer.close());

    return new Response(readable, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
};
