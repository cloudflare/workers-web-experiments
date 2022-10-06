import { parse } from "cookie";
import { PiercingGateway } from "piercing-lib";

export interface Env {
  APP_BASE_URL: string;
}

const gateway = new PiercingGateway<Env>({
  getBaseAppUrl: (env) => env.APP_BASE_URL,
});

const cookiesPrefix = "piercingDemoSuite_";

function isUserAuthenticated(request: Request) {
  const cookie = parse(request.headers.get("Cookie") || "");
  const currentUser = cookie[`${cookiesPrefix}current-user`];
  return !!currentUser;
}

gateway.registerFragment({
  fragmentId: "login",
  getBaseUrl: () => `http:0.0.0.0/build`,
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host {
			position: absolute;
    }`,
  shouldBeIncluded: async (request: Request) => !isUserAuthenticated(request),
});

export default gateway;
