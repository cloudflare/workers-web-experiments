import { manifest } from "@qwik-client-manifest";
import { Gallery } from "./root";
import { renderResponse } from "helpers";

export default {
	fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
		return renderResponse(request, env, <Gallery />, manifest, "div");
	},
};
