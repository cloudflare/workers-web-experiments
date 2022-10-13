import { manifest } from "@qwik-client-manifest";
import { Header } from "./root";
import { renderResponse } from "helpers";

export default {
  fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
    const url = new URL(request.url);

    return renderResponse(
      request,
      env,
      <Header base={url.searchParams.get("base") ?? ""} />,
      manifest,
      "header"
    );
  },
};
