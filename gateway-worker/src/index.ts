import { parse } from "cookie";
import { FragmentConfig, PiercingGateway } from "piercing-lib";

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
    `https://piercing-productivity-suite-login-fragment.devdash.workers.dev`,
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
    `https://piercing-productivity-suite-todo-lists-fragment.devdash.workers.dev`,
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
      position: absolute;
      top: 16.5rem;
      left: 1.5rem;
    }`,
  shouldBeIncluded: async (request: Request) =>
    isUserAuthenticated(request) &&
    /^\/(todos(\/[^/]+)?)?$/.test(new URL(request.url).pathname),
  convertRequest: (
    request: Request,
    env: Env,
    thisConfig: FragmentConfig<Env>
  ) => {
    const path = new URL(request.url).pathname;
    const match = /^\/todos\/([^/]+)$/.exec(path);

    if (!match) return request;

    const listName = decodeURIComponent(match[1]);
    const params = new URLSearchParams({ listName });

    return new Request(`${thisConfig.getBaseUrl(env)}?${params}`, request);
  },
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
    /\/todos\/[^/]+/.test(new URL(request.url).pathname),
  convertRequest: (
    request: Request,
    env: Env,
    thisConfig: FragmentConfig<Env>
  ) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const match = /\/todos\/([^/]+)$/.exec(path);
    const listName =
      (match?.[1] && decodeURIComponent(match[1])) ??
      url.searchParams.get("listName");

    if (!listName) return request;

    const params = new URLSearchParams({ listName });

    return new Request(`${thisConfig.getBaseUrl(env)}?${params}`, request);
  },
});

export default gateway;
