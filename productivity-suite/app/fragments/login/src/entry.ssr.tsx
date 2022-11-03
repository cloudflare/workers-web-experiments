import { renderToStream } from "@builder.io/qwik/server";
import { manifest } from "@qwik-client-manifest";
import { Root } from "./root";

export default {
  async fetch(request: Request): Promise<Response> {
    const { writable, readable } = new TransformStream();
    const writer = writable.getWriter();

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
      containerTagName: "login",
      qwikLoader: { include: "never" },
      base: "/_fragment/login/build",
      stream,
    }).finally(() => writer.close());

    return new Response(readable, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
};
