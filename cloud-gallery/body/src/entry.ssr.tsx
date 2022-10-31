import { manifest } from "@qwik-client-manifest";
import { renderResponse, tryGetFragmentAsset } from "helpers";
import Body from "./root";

export default {
	async fetch(
		request: Request,
		env: Record<string, unknown>
	): Promise<Response> {
		// Requests for assets hosted by a fragment service must be proxied through to the client.
		const asset = await tryGetFragmentAsset(env, request);
		if (asset !== null) {
			return asset;
		}
		// Otherwise SSR the application injecting any fragments into the response stream.
		return renderResponse(request, env, <Body />, manifest, "div");
	},
};
