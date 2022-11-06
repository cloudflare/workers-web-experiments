import { FragmentConfig, PiercingGateway } from "piercing-library";
import { getCurrentUser, getTodoLists } from "shared";

export interface Env {
  APP_BASE_URL: string;
}

const gateway = new PiercingGateway<Env>({
  getBaseAppUrl: (env) => env.APP_BASE_URL,
  generateMessageBusState: async (requestMessageBusState, request) => {
    const requestCookie = request.headers.get("Cookie");
    const currentUser = requestCookie
      ? await getCurrentUser(requestCookie)
      : null;

    if (!("authentication" in requestMessageBusState)) {
      requestMessageBusState["authentication"] = currentUser && {
        username: currentUser,
      };
    }

    if (!("todo-list-selected" in requestMessageBusState) && currentUser) {
      const match = /\/todos\/([^/]+)$/.exec(request.url);
      let listName = match?.[1] && decodeURIComponent(match[1]);

      const lists = await getTodoLists(currentUser, requestCookie!);
      // make sure that the provided listName is the name of an existing list
      listName = lists.find(({ name }) => name === listName)?.name;

      if (!listName) {
        if (lists.length) {
          listName = lists[lists.length - 1].name;
        }
      }

      requestMessageBusState["todo-list-selected"] = { name: listName } ?? null;
    }
    return requestMessageBusState;
  },
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
      top: 10.45rem;
      left: 1rem;
      right: 1rem;
    }

    @media (max-width: 45rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host {
        top: 10.57rem;
      }
    }
    @media (max-width: 35rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host {
        top: 13.05rem;
      }
    }
    @media (max-width: 25rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host {
        top: 13.4rem;
      }
    }
    `,
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
      top: 14.7rem;
      left: 2rem;
      right: 2rem;
    }

    @media (max-width: 45rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
        top: 14.85rem;
      }
    }
    @media (max-width: 35rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
        top: 29.87rem;
      }
    }
    @media (max-width: 25rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todo-lists"] {
        top: 30.55rem;
      }
    }
    `,
  shouldBeIncluded: async (request: Request) =>
    isPiercingEnabled(request) &&
    (await isUserAuthenticated(request)) &&
    /^\/(todos(\/[^/]+)?)?$/.test(new URL(request.url).pathname),
  transformRequest: (
    request: Request,
    env: Env,
    thisConfig: FragmentConfig<Env>
  ) => {
    const path = new URL(request.url).pathname;
    const match = /^\/todos\/([^/]+)$/.exec(path);

    if (!match) return request;

    const listName = decodeURIComponent(match[1]);
    const params = new URL(request.url).searchParams;
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
      top: 23.7rem;
      left: 2rem;
      right: 2rem;
    }

    @media (max-width: 45rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todos"] {
        top: 23.97rem;
      }
    }
    @media (max-width: 35rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todos"] {
        top: 39.03rem;
      }
    }
    @media (max-width: 25rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="todos"] {
        top: 42.7rem;
      }
    }
    `,
  shouldBeIncluded: async (request: Request) =>
    isPiercingEnabled(request) &&
    (await isUserAuthenticated(request)) &&
    /^\/(todos(\/[^/]+)?)?$/.test(new URL(request.url).pathname),
  transformRequest: (
    request: Request,
    env: Env,
    thisConfig: FragmentConfig<Env>
  ) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const match = /\/todos\/([^/]+)$/.exec(path);
    const listName = match?.[1] && decodeURIComponent(match[1]);

    const params = url.searchParams;
    if (listName) {
      params.append("listName", listName);
    }
    return new Request(`${thisConfig.getBaseUrl(env)}?${params}`, request);
  },
});

gateway.registerFragment({
  fragmentId: "news",
  // Note: deployment part of the url is fine also for local development since then
  //       only the path part of the url is being used
  getBaseUrl: () =>
    `https://productivity-suite-news-fragment.devdash.workers.dev`,
  prePiercingStyles: `
    :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="news"] {
      position: absolute;
      margin: 0 auto;
      top: 13.9rem;
      left: 0;
      right: 0;
    }

    @media (max-width: 45rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="news"] {
        top: 14.05rem;
      }
    }

    @media (max-width: 35rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="news"] {
        top: 29rem;
      }
    }

    @media (max-width: 25rem) {
      :not(piercing-fragment-outlet) > piercing-fragment-host[fragment-id="news"] {
        top: 29.65rem;
        margin: 0;
      }
    }
    `,
  shouldBeIncluded: async (request: Request) =>
    isPiercingEnabled(request) &&
    (await isUserAuthenticated(request)) &&
    /^\/news(\/[^/]+)?$/.test(new URL(request.url).pathname),
  transformRequest: (
    request: Request,
    env: Env,
    thisConfig: FragmentConfig<Env>
  ) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const match = /\/news\/([^/]+)$/.exec(path);
    // todo: add pagination and/or routing to request searchParams here
    return request;
  },
});

export default gateway;
