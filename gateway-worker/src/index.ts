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
  const currentUser = cookie[`${cookiesPrefix}currentUser`];
  return !!currentUser;
}

gateway.registerFragment({
  fragmentId: "login",
  // Note: deployment part of the url is fine also for local development since then
  //       only the path part of the url is being used
  getBaseUrl: () =>
    `https://piercing-productivity-suite-login-fragment.devdash.workers.dev/build`,
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host {
			position: absolute;
      top: 7.2rem;
      left: .5rem;
    }`,
  shouldBeIncluded: async (request: Request) => !isUserAuthenticated(request),
});

gateway.registerFragment({
  fragmentId: "todo-lists",
  // Note: deployment part of the url is fine also for local development since then
  //       only the path part of the url is being used
  getBaseUrl: () =>
    `https://piercing-productivity-suite-todo-lists-fragment.devdash.workers.dev/build`,
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
      position: absolute;
      top: 16.5rem;
      left: 1.5rem;
    }`,
  shouldBeIncluded: async (request: Request) =>
    isUserAuthenticated(request) &&
    ["/", "/todos"].includes(new URL(request.url).pathname),
});

gateway.registerFragment({
  fragmentId: "todos",
  // Note: deployment part of the url is fine also for local development since then
  //       only the path part of the url is being used
  getBaseUrl: () =>
    `https://piercing-productivity-suite-todos-fragment.devdash.workers.dev/_fragment/todos`,
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todos"] {
      position: absolute;
      top: 16.5rem;
      left: 17.5rem;
    }`,
  shouldBeIncluded: async (request: Request) =>
    isUserAuthenticated(request) &&
    ["/", "/todos"].includes(new URL(request.url).pathname),
});

export default gateway;
