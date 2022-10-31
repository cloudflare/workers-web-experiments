import { manifest } from "@qwik-client-manifest";
import { Header } from "./root";
import { renderResponse } from "helpers";

export default {
	fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
		return renderResponse(request, env, <Header />, manifest, "header");
	},
};
