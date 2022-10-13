import { StreamWriter } from "@builder.io/qwik";
import { renderToStream } from "@builder.io/qwik/server";

export async function renderResponse(
  request: Request,
  env: Record<string, unknown>,
  RootNode: any,
  manifest: unknown,
  fragmentName?: string
) {
  const { writable, readable } = new TransformStream();
  const response = new HtmlResponse(readable);
  const stream = new SimpleStreamWriter(writable);
  const fragmentBase = getBase(request);
  renderToStream(RootNode, {
    streaming: {
      inOrder: {
        strategy: "auto",
      },
    },
    manifest,
    ...(fragmentName && { containerTagName: fragmentName }),
    stream,
    envData: { request, env, fragmentBase },
    qwikLoader: { include: "auto" },
    base: fragmentBase + "build/",
  }).finally(() => {
    stream.close();
  });
  return response;
}

function getBase(request: Request): string {
  const url = new URL(request.url);
  return url.searchParams.get("base") ?? "/";
}

class HtmlResponse extends Response {
  constructor(bodyInit: BodyInit) {
    super(bodyInit, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }
}

class SimpleStreamWriter implements StreamWriter {
  private writer = this.writable.getWriter();
  private encoder = new TextEncoder();
  constructor(private writable: WritableStream) {}

  write(chunk: string) {
    this.writer.write(
      typeof chunk === "string" ? this.encoder.encode(chunk) : chunk
    );
  }

  close() {
    this.writer.close();
  }
}

export * from "./useLocation";
export * from "./cookies";
export * from "./fragment-helpers";
export * from "./isBrowser";
export * from "./base";
