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

gateway.registerFragment({
  fragmentId: "todo-lists",
  getBaseUrl: () => `http:0.0.0.0/build`,
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
      position: absolute;
      top: 16.5rem;
      left: 1rem;
    }`,
  shouldBeIncluded: async (request: Request) =>
    isUserAuthenticated(request) && new URL(request.url).pathname === "/todos",
});

gateway.registerFragment({
  fragmentId: "todos",
  getBaseUrl: () => `http:0.0.0.0/_fragment/todos`,
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todos"] {
      position: absolute;
      top: 16.5rem;
      left: 17rem;
    }`,
  shouldBeIncluded: async (request: Request) =>
    isUserAuthenticated(request) && new URL(request.url).pathname === "/todos",
});

export default gateway;
