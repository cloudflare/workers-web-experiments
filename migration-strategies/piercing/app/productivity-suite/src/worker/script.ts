import { FragmentConfig, PiercingGateway } from "piercing-library";
import { getCurrentUser } from "shared";

export interface Env {
  APP_BASE_URL: string;
}

const gateway = new PiercingGateway<Env>({
  getBaseAppUrl: (env) => env.APP_BASE_URL,
});

async function isUserAuthenticated(request: Request) {
  const currentUser = await getCurrentUser(request.headers.get("Cookie") || "");
  return !!currentUser;
}

function isPiercingEnabled(request: Request) {
  const match = request.headers
    .get("Cookie")
    ?.match(/piercingEnabled=(true|false)/);
  const piercingEnabled = !match ? null : match[1] === "true" ? true : false;
  return piercingEnabled === null ? true : piercingEnabled;
}

gateway.registerFragment({
  fragmentId: "login",
  // Note: deployment part of the url is fine also for local development since then
  //       only the path part of the url is being used
  getBaseUrl: () =>
    `https://productivity-suite-login-fragment.devdash.workers.dev`,
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host {
      position: absolute;
      top: 10.3rem;
      left: 0;
      right: 0;
    }`,
  shouldBeIncluded: async (request: Request) =>
    isPiercingEnabled(request) &&
    isUserAuthenticated(request).then((authenticated) => !authenticated),
});

gateway.registerFragment({
  fragmentId: "todo-lists",
  // Note: deployment part of the url is fine also for local development since then
  //       only the path part of the url is being used
  getBaseUrl: () =>
    `https://productivity-suite-todo-lists-fragment.devdash.workers.dev`,
  prePiercingStyles: `
		:not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
      position: absolute;
      top: 14.8rem;
      left: 2rem;
      right: 2rem;
    }`,
  shouldBeIncluded: async (request: Request) =>
    isPiercingEnabled(request) &&
    (await isUserAuthenticated(request)) &&
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
    const params = new URLSearchParams();
    if (listName) {
      params.append("listName", listName);
    }

    return new Request(`${thisConfig.getBaseUrl(env)}?${params}`, request);
  },
});

gateway.registerFragment({
  fragmentId: "todos",
  // Note: deployment part of the url is fine also for local development since then
  //       only the path part of the url is being used
  getBaseUrl: () =>
    `https://productivity-suite-todos-fragment.devdash.workers.dev/_fragment/todos`,
  prePiercingStyles: `
    :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todos"] {
      position: absolute;
      top: 24.6rem;
      left: 0;
      right: 0;
    }
    `,
  shouldBeIncluded: async (request: Request) =>
    isPiercingEnabled(request) &&
    (await isUserAuthenticated(request)) &&
    /^\/(todos(\/[^/]+)?)?$/.test(new URL(request.url).pathname),
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

    const params = new URLSearchParams();
    if (listName) {
      params.append("listName", listName);
    }
    return new Request(`${thisConfig.getBaseUrl(env)}?${params}`, request);
  },
});

export default gateway;